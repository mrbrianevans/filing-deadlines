


/*

Listen to notifications:filing stream and when there is an event, send notifications to any subscribers.

 */
import { getRedisClient } from '../../backend-shared/getRedisClient.js'
import { workerLogger } from '../../backend-shared/loggers.js'
import {listenRedisStream} from '../../backend-shared/notifications/redisStreams.js'
import {sendWebNotification} from '../../backend-shared/notifications/sendWebNotification.js'
import {notificationNames} from '../../fs-shared/Notifications.js'


interface FilingNotification extends Record<string,string>{
  companyNumber: string
  // json string of original event. can be parsed back into an object.
  event: string
}

export async function listenToFilingNotifications(signal?: AbortSignal) {
  const logger = workerLogger.child({workerType:'listener', stream: 'notifications'})
  logger.info('Started listening on notifications Redis Stream for filings')
  const notifications = listenRedisStream<FilingNotification>(['notifications:filing'], {signal})

  for await(const notification of notifications) {
    try {
      const redis = getRedisClient()
      const {companyNumber, transactionId, event} = notification.data
      const filingEvent = JSON.parse(event)
      logger.info({companyNumber, transactionId}, 'Notification received on Redis Stream')
      //todo: format notification text better
      const webNotification = {
        title: 'A new filing for a company on your client list',
        options: {
          body: `Company number: ${companyNumber}. Category: ${filingEvent.data.category}`,
          url: '/recent-filings?p=P1D' // recent filings in the last 1 Day
        }
      }
      const interestedOrgs = await redis.smembers(`company:${companyNumber}:clientLists`)
      logger.debug({interestedOrgs}, 'interested orgs') // todo: there is a problem because these debugs are NOT showing in grafana
      for (const orgId of interestedOrgs) {
        const membersOfOrg = await redis.smembers(`org:${orgId}:activeMembers`)
        logger.debug({membersOfOrg}, 'members of org')
        for (const userId of membersOfOrg) {
          const wantsNotification = await redis.hget(`user:${userId}:notifications:preferences`, notificationNames.webFilings).then(JSON.parse)
          logger.debug({wantsNotification, userId}, 'user wants notification')
          if (wantsNotification) {
            logger.info({wantsNotification, userId, orgId}, 'Filing for subscribed users company')
            // send web notification
            await sendWebNotification({userId, notification: webNotification})
          }
        }
        // todo: save in organisation notification history
      }
      await redis.quit()
    }catch (e) {
      logger.error(e,'Error processing filing notification')
    }
  }
}

