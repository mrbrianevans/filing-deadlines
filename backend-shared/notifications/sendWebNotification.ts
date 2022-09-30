import {getRedisClient} from "../getRedisClient.js";
import webPush,{PushSubscription} from 'web-push'
import {sharedLogger} from "../loggers.js";


export interface WebNotification{
  title: string,
  options?: NotificationOptions
}

interface SendWebNotificationOptions{
  userId: string,
  notification: WebNotification
}

export async function sendWebNotification({userId, notification}: SendWebNotificationOptions){
  const logger = sharedLogger.child({action: 'sendWebNotification', userId, notification})
  logger.info('Sending web notification to user')
  const redis = getRedisClient()
  // could be done with Redis.MGET or at least Promise.all
  const publicVapidKey = await redis.get(`notifications:vapidKeys:public`)
  const privateVapidKey = await redis.get(`notifications:vapidKeys:private`)
  if(!publicVapidKey || !privateVapidKey) throw new Error('Attempted to send notification but VAPID keys are not set in Redis')
  const userSubscription: PushSubscription|undefined = await redis.get(`user:${userId}:notifications:subscription`).then(JSON.parse)
  if (userSubscription) {
    const startTime = performance.now()
    await webPush.sendNotification(userSubscription, JSON.stringify(notification), {
      vapidDetails: {
        privateKey: privateVapidKey,
        publicKey: publicVapidKey,
        subject: 'https://github.com/mrbrianevans/filing-deadlines/issues'
      }
    })
    const duration = performance.now() - startTime
    logger.info({duration}, 'Send web notification to user in %i ms', duration)
  }else{
    logger.warn('Requested to send notification to user who doesn\'t have a Push API subscription')
    throw new Error('Requested to send notification to user who doesn\'t have a Push API subscription')
  }
  await redis.quit()
}
