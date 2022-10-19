import type {FastifyPluginAsync} from "fastify";
import { getEnv } from "../../backend-shared/utils.js";
import Stripe from "stripe";


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
  {
    const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {apiVersion: '2022-08-01'})
    fastify.decorate('stripe', stripe)
  }

  // allows access to raw body for verifying signature from Stripe
  await fastify.register(import('fastify-raw-body'), {
    field: 'rawBody',
    global: false // add the rawBody to every request. **Default true**
  })

  const endpointSecret = getEnv('STRIPE_WEBHOOK1_SECRET')
  fastify.post<{Headers: {'stripe-signature':string}}>('/subscriptions', {schema: webhookSchema, config: {rawBody: true}},async (request, reply)=>{
    const event = await fastify.stripe.webhooks.constructEventAsync(request.rawBody??'', request.headers['stripe-signature'], endpointSecret)

// handle the different types of events that the application is subscribed to. The business logic should be in separate files
    switch (event.type){

      case 'invoice.created':
        console.log('invoice created')
        break;
      case 'invoice.paid':
        console.log('invoice paid, update expiry time for customer')
        break;
      case 'checkout.session.completed':
        console.log('Checkout completed')
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('customer subscription changed')
        break;
      default:
        console.log('unhandled event type:', event.type)
    }

    return reply.status(200).send()
  })


  async function updateSubscription(subscriptionId, customerId){
    const subscription = await fastify.stripe.subscriptions.retrieve(subscriptionId, { expand: ['default_payment_method'] })
    //todo: set JSON object in Redis for subscription in user:userId:subscription
    const storeSubscription = {
      id: subscription.id,
      customerId: customerId,
      metadata: subscription.metadata,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      //TODO check quantity on subscription
      // @ts-ignore
      quantity: subscription.quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at
        ? toDateTime(subscription.cancel_at).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : null,
      current_period_start: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      current_period_end: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      created: toDateTime(subscription.created).toISOString(),
      ended_at: subscription.ended_at
        ? toDateTime(subscription.ended_at).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : null
    }
    //todo: set org:{orgId}:subscriptionActiveUntil = current_period_end
  }
}

export default StripeWebhooksPlugin

const toDateTime = (secs: number) => {
  const t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};
