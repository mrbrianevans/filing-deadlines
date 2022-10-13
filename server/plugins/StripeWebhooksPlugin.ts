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
      default:
        console.log('unhandled event type:', event.type)
    }

    return reply.status(200).send()
  })


}

export default StripeWebhooksPlugin
