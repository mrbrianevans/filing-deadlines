import {RedisClient} from "bullmq";
import {getUserFromIdToken,decodeAccessToken} from '../backend-shared/jwtTokens.js'


// prints details about a user by their user ID
export async function getUser(redis: RedisClient, userId: string){
  const idToken = await redis.get(`user:${userId}:id`)
  if(!idToken) {
    return 'User does not exist in database'
  }else {
    const user = getUserFromIdToken(idToken)
    const orgId = await redis.get(`user:${userId}:org`)
    const orgName = await redis.get(`org:${orgId}:name`)
    return `
  User: ${userId}
    Name: ${user.name}
    Email: ${user.email}
    Username: ${user.preferred_username}
    Auth time: ${new Date(user.auth_time * 1000)}
  Org: ${orgId}
    Name: ${orgName}
  `
  }
}
