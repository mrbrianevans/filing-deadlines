import {getRedisClient} from "../getRedisClient.js";


export async function getOrgNotificationCount(orgId: string){
  const redis = getRedisClient()
  const count = await redis.xlen(`org:${orgId}:notifications`)
  await redis.quit()
  return count
}


export async function waitForNotification(orgId: string){
  const redis = getRedisClient()
  const event = await redis.xread('BLOCK', 0, 'STREAMS',`org:${orgId}:notifications`, '$')
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
