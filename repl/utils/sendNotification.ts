import {RedisClient} from "bullmq";
import {sendWebNotification, WebNotification} from "../../backend-shared/notifications/sendWebNotification.js";

export async function sendNotification(redis: RedisClient,userId: string, {title, message}){
  const notification: WebNotification = {title, options:{body: message,tag: 'custom-repl-notification',
      icon: 'https://filingdeadlines.co.uk/icon/icon500.svg',}}
  await sendWebNotification({userId: userId, notification})
}
