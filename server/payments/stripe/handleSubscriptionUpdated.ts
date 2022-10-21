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

/** Get the current subscription plan for an organisation. Returns undefined if no active plan */
export async function getOrgPlan(orgId: string){
  const redis = getRedisClient()

  const subscriptionPlan = await redis.get(`org:${orgId}:subscriptionPlan`) as SubscriptionPlans
  const activeUntil = await redis.get(`org:${orgId}:subscriptionActiveUntil`).then(secs=>new Date(parseInt(secs??'0') * 1000))
  const status = await redis.get(`org:${orgId}:subscriptionStatus`) as Stripe.Subscription.Status

  await redis.quit()

  if(subscriptionPlan && status === 'active' || status === 'trialing' && inFuture(activeUntil))
    return subscriptionPlan
  else return undefined
}

function inFuture(date: Date){
  return Date.now() - date.getTime() < 0
}
