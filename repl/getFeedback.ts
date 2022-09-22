import type {RedisClient} from "bullmq";
import type {StoredFeedback} from '../fs-shared/Feedback.js'
import { getUserFromIdToken } from "../backend-shared/jwtTokens.js";

export async function getFeedback(redis: RedisClient){
  const ids = await redis.keys(`feedback:*`) // there shouldn't be very many of these, so keys is fine
  for (const id of ids) {
    const feedback = <StoredFeedback>await redis.hgetall(id)
    const userIdToken = await redis.get(`user:${feedback.userId}:id`)
    const user = userIdToken?getUserFromIdToken(userIdToken):{name: 'anonymous',email:'none'}
    console.log(`
    Title: ${feedback.title} [Type=${feedback.feedbackType}] [Status=${feedback.status}]
    Requested by: ${user.name}<${user.email}>(${feedback.userId}) at ${feedback.requestedAt}
    
    ${feedback.description.split('\n').join('\n\t')}
    ${'-'.repeat(20)}
    `)
  }
}
