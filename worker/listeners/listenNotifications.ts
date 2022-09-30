


/*

Listen to notifications:filing stream and when there is an event, send notifications to any subscribers.

 */
import { getRedisClient } from '../../backend-shared/getRedisClient.js'
import {listenRedisStream} from '../../backend-shared/notifications/redisStreams.js'
import {sendWebNotification} from '../../backend-shared/notifications/sendWebNotification.js'
import {notificationNames} from '../../fs-shared/Notifications.js'


interface FilingNotification extends Record<string,string>{
  companyNumber: string
  // json string of original event. can be parsed back into an object.
  event: string
}

export async function listenToFilingNotifications(signal?: AbortSignal) {
  const notifications = listenRedisStream<FilingNotification>(['notifications:filing'], {signal})

  for await(const notification of notifications) {
    const redis = getRedisClient()
    console.log('Notification on stream', notification.data)
    const filingEvent = JSON.parse(notification.data.event)
    const {companyNumber} = notification.data
    //todo: format notification text better
    const webNotification = {title: 'A new filing for a company on your client list', body: `Company number: ${companyNumber}. Category: ${filingEvent.data.category}`}
    const interestedOrgs =  await redis.smembers(`company:${companyNumber}:clientLists`)
    for (const orgId of interestedOrgs) {
      const membersOfOrg = await redis.hkeys(`org:${orgId}:activeUsers`)
      for(const userId of membersOfOrg){
        const wantsNotification = await redis.hget(`user:${userId}:notifications:preferences`, notificationNames.webFilings).then(JSON.parse)
        if(wantsNotification){
          // send web notification
          await sendWebNotification({userId, notification:webNotification})
        }
      }
      // todo: save in organisation notification history
    }
    await redis.quit()
  }
}

