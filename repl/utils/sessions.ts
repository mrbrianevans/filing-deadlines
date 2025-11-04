import {RedisClient} from "bullmq";
import {getUser} from "../getUserAndOrg.js";

/**
 * Clears all user sessions from Redis. This will log out all users and force them to log in again.
 */
export async function clearSessions(redis: RedisClient){
  const sessions = await redis.keys('sess:*')
  for(const session of sessions){
    await redis.del(session)
  }
  console.log('Deleted', sessions.length, 'active sessions')
}


export async function printSessions(redis: RedisClient){
    const sessions =  await redis.keys('sess:*')
    console.log(sessions.length, 'active sessions')
    for(const sessionKey of sessions){
        const sessionString = await redis.get(sessionKey)
        const parsedSession = JSON.parse(sessionString??'{}')
        const user = await getUser(redis, parsedSession.userId)
        console.log(user, parsedSession)
        console.log('\n\n\n')
    }
}