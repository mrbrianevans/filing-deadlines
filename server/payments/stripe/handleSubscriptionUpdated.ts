import type Stripe from "stripe";
import { getRedisClient } from "../../../backend-shared/getRedisClient.js";
import type { SubscriptionPlans } from "../../../fs-shared/SubscriptionPlans.js";


export async function handleSubscriptionUpdated(subscription: Stripe.Subscription, subscriptionPlan: SubscriptionPlans){
  const redis = getRedisClient()

  await redis.set(`stripe:subscription:${subscription.id}`, JSON.stringify(subscription))

  const userId = await redis.get(`stripe:customer:${subscription.customer}:userId`) as string
  const orgId = await redis.get(`stripe:customer:${subscription.customer}:orgId`) as string
  await redis.set(`stripe:subscription:${subscription.id}:orgId`, orgId)
  await redis.set(`org:${orgId}:subscriptionId`, subscription.id)

  await redis.set(`org:${orgId}:subscriptionPlan`, subscriptionPlan)
  await redis.set(`org:${orgId}:subscriptionActiveUntil`, subscription.current_period_end)
  await redis.set(`org:${orgId}:subscriptionStatus`, subscription.status)

  await redis.quit()
}
