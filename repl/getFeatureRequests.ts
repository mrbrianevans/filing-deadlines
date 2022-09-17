import type {RedisClient} from "bullmq";
import type {StoredFeatureRequest} from '../fs-shared/FeatureRequest.js'
import { getUserFromIdToken } from "../backend-shared/jwtTokens.js";

export async function getFeatureRequests(redis: RedisClient){
  const ids = await redis.keys(`featureRequest:*`) // there shouldn't be very many of these
  for (const id of ids) {
    const request = <StoredFeatureRequest>await redis.hgetall(id)
    const userIdToken = await redis.get(`user:${request.userId}:id`)
    const user = userIdToken?getUserFromIdToken(userIdToken):{name: 'anonymous',email:'none'}
    console.log(`
    Title: ${request.featureTitle} 
    Requested by: ${user.name}<${user.email}>(${request.userId}) at ${request.requestedAt}
    
    ${request.featureDescription}
    `)
  }
}
