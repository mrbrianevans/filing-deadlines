import {getRedisClient} from "../getRedisClient.js";
import webPush,{PushSubscription} from 'web-push'


export interface WebNotification{
  title: string,
  options?: NotificationOptions
}

interface SendWebNotificationOptions{
  userId: string,
  notification: WebNotification
}

export async function sendWebNotification({userId, notification}: SendWebNotificationOptions){
  const redis = getRedisClient()
  // could be done with Redis.MGET or at least Promise.all
  const publicVapidKey = await redis.get(`notifications:vapidKeys:public`)
  const privateVapidKey = await redis.get(`notifications:vapidKeys:private`)
  if(!publicVapidKey || !privateVapidKey) throw new Error('Attempted to send notification but VAPID keys are not set in Redis')
  const userSubscription: PushSubscription|undefined = await redis.get(`user:${userId}:notifications:subscription`).then(JSON.parse)
  if (userSubscription) {
    console.time('Send notification')
    await webPush.sendNotification(userSubscription, JSON.stringify(notification), {
      vapidDetails: {
        privateKey: privateVapidKey,
        publicKey: publicVapidKey,
        subject: 'https://github.com/mrbrianevans/filing-deadlines/issues'
      }
    })
    console.timeEnd('Send notification')
  }else{
    throw new Error('Requested to send notification to user who doesn\'t have a Push API subscription')
  }
  await redis.quit()
}
