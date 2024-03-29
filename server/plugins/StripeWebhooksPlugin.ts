import type {FastifyPluginAsync} from "fastify";
import { getEnv } from "../../backend-shared/utils.js";
import Stripe from "stripe";
import { getUserFromIdToken } from "../../backend-shared/jwtTokens.js";
import {handleCheckoutCompleted} from "../payments/stripe/handleCheckoutCompleted.js";
import {handleSubscriptionUpdated} from "../payments/stripe/handleSubscriptionUpdated.js";
import type { SubscriptionPlans } from "../../fs-shared/SubscriptionPlans.js";


const webhookSchema = {
  headers: {
    type: 'object',
    properties: {
      'Stripe-Signature': {type:'string'}
    },
    required: ['Stripe-Signature']
  }
}

// listens on /api/webhooks/stripe/* for webhooks
const StripeWebhooksPlugin: FastifyPluginAsync = async (fastify, opts) => {

    const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {apiVersion: '2022-11-15'})
    fastify.decorate('stripe', stripe)
    fastify.log = fastify.log.child({action:'webhook', webhookInvoker: 'stripe'})


  // allows access to raw body for verifying signature from Stripe
  await fastify.register(import('fastify-raw-body'), {
    field: 'rawBody',
    global: false // add the rawBody to every request. **Default true**
  })

  const endpointSecret = getEnv('STRIPE_WEBHOOK1_SECRET')
  fastify.post<{Headers: {'stripe-signature':string}}>('/subscriptions', {schema: webhookSchema, config: {rawBody: true}},async (request, reply)=>{
    const event = await fastify.stripe.webhooks.constructEventAsync(request.rawBody??'', request.headers['stripe-signature'], endpointSecret)
    const {id, type, created, livemode, api_version} = event
    fastify.log.info({event: {id, type, created, livemode, api_version}}, 'Webhook called with event type: '+ type)
// handle the different types of events that the application is subscribed to. The business logic should be in separate files
    switch (event.type){
      case 'invoice.paid': {
        const invoice = <Stripe.Invoice>event.data.object
        fastify.log.info({invoiceId: invoice.id}, 'Invoice paid')
        const subscriptionId = invoice.subscription
        if(typeof subscriptionId !== 'string') throw new Error('Subscription ID not a string? '+JSON.stringify(subscriptionId))
        const subscription = await fastify.stripe.subscriptions.retrieve(subscriptionId)
        const productId = subscription.items.data[0].price.product
        if(typeof productId !== 'string') throw new Error('Product ID not a string? '+JSON.stringify(productId))
        const product = await fastify.stripe.products.retrieve(productId)
        const plan = product.metadata.planEnum as SubscriptionPlans
        await handleSubscriptionUpdated(subscription, plan)
        break;
      }
      case 'checkout.session.completed': {
        // link the Stripe customer with the Redis user, by using client_reference_id (userId) and customerId
        const checkoutSession = <Stripe.Checkout.Session>event.data.object
        fastify.log.info({checkoutSessionId: checkoutSession.id}, 'Checkout session completed')
        const {client_reference_id, customer} = checkoutSession
        const customerId = typeof customer === 'string' ? customer : customer?.id??'null'
        const userId = client_reference_id as string
        fastify.log.info({client_reference_id, customerId}, 'Checkout session completed')
        await handleCheckoutCompleted(userId, customerId)
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = <Stripe.Subscription>event.data.object
        fastify.log.info({subscriptionId: subscription.id}, 'Subscription %s', event.type.split('.').at(-1))
        // could move the logic to get the first product into the handler, except that it requires the Stripe instance
        const productId = subscription.items.data[0].price.product
        const product = typeof productId === 'string' ? await fastify.stripe.products.retrieve(productId) : productId as Stripe.Product
        const {id, status, trial_end, current_period_end, current_period_start} = subscription
        const plan = product.metadata.planEnum as SubscriptionPlans
        fastify.log.info({id, status, productId, plan}, 'customer subscription changed')
        await handleSubscriptionUpdated(subscription, plan)
        break;
      }
    }

    return reply.status(200).send()
  })
}

export default StripeWebhooksPlugin

const toDateTime = (secs: number) => {
  const t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};
