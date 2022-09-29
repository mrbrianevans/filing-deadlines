


/*

Listen to notifications:filing stream and when there is an event, send notifications to any subscribers.

 */
import {listenRedisStream} from '../../backend-shared/notifications/redisStreams.js'


interface FilingNotification {
  companyNumber: string
  // json string of original event. can be parsed back into an object.
  event: string
}

export async function listenToFilingNotifications(signal?: AbortSignal) {
  const notifications = listenRedisStream(['notifications:filing'], {signal})

  for await(const notification of notifications) {
    console.log('Notification on stream', notification.data)
    const filingEvent = JSON.parse(notification.data.event)
    // todo: send web notification, save in organisation notification history

  }
}



async function sendWebNotification(orgId: string){

}
