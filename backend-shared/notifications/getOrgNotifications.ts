import {getRedisClient} from "../getRedisClient.js";


export async function getFilingNotificationCount(){
  const redis = getRedisClient()
  const count = await redis.xlen(`notifications:filing`)
  await redis.quit()
  return count
}


export async function waitForFilingNotification(){
  const redis = getRedisClient()
  const event = await redis.xread('BLOCK', 0, 'STREAMS',`notifications:filing`, '$')
  await redis.quit()
  if(event){
    const [key, items] = event[0]
    console.log("Got", items.length, 'items on', key)
    const [eventId, data] = items[0]
    console.log("Event ID: ", eventId)
    return data
  }
  return event
}
