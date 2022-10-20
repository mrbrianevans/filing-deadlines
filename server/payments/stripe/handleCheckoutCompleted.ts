import type Stripe from "stripe";
import { getRedisClient } from "../../../backend-shared/getRedisClient.js";
import type { IdToken } from "../../../backend-shared/jwtTokens.js";

/**
 * When a checkout is completed:
 *  - link the checkout session to a user by the client_reference_id property.
 *  The other details of the subscription, such as status and expiry date, will be set when the subscription is updated.
 */
export async function handleCheckoutCompleted(userId: string, customerId: string){
  if(!userId) throw new Error('client_reference_id not set on checkout session. Can\'t identify user.')
  const redis = getRedisClient()
  const orgId = await redis.get(`user:${userId}:org`) as string
  await redis.set(`user:${userId}:customerId`, customerId)
  await redis.set(`stripe:customer:${customerId}:orgId`, orgId)
  await redis.set(`stripe:customer:${customerId}:userId`, userId)
  await redis.quit()
}
