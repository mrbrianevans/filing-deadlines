import {RedisClient} from "bullmq";
import {IdTokenUser} from '../backend-shared/jwtTokens.js'


// prints details about a user by their user ID
export async function getUser(redis: RedisClient, userId: string){
  const idTokenUser = <IdTokenUser|null>await redis.get(`user:${userId}:idProfile`).then(i=>i ? JSON.parse(i) : null)
  if(!idTokenUser) {
    return 'User does not exist in database'
  }else {
    const user = idTokenUser
    const orgId = await redis.get(`user:${userId}:org`)
    const orgName = await redis.get(`org:${orgId}:name`)
    return `
  User: ${userId}
    Name: ${user.name}
    Email: ${user.email}
    Username: [no longer available]
    Token issued at: ${user.issuedAt}
    Token expires: ${user.expiresAt}
    Issued by: ${user.issuer}
  Org: ${orgId}
    Name: ${orgName}
  `
  }
}
