import {RedisClient} from "bullmq";

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
