import type {FastifyPluginAsync} from "fastify";
import Stripe from 'stripe';
import { getEnv } from "../../backend-shared/utils.js";
import {SubscriptionPlans} from '../../fs-shared/SubscriptionPlans.js'

// these should maybe be in the database or in a .env file
const subscriptionProducts: Record<SubscriptionPlans, string> = {
  [SubscriptionPlans.BASIC]: getEnv('STRIPE_BASIC_PRICE'),
  [SubscriptionPlans.PREMIUM]: getEnv('STRIPE_PREMIUM_PRICE')
}


const createSessionSchema = {
  querystring: {
    type: 'object',
    properties: {
      plan: {type: 'string', enum: Object.values(SubscriptionPlans)}
    }
  }
}

const PaymentPlugin: FastifyPluginAsync = async (fastify, opts) => {
  {
    const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {apiVersion: '2022-08-01'})
    fastify.decorate('stripe', stripe)
  }


  fastify.get<{Querystring: {plan:SubscriptionPlans}}>('/create-session', {schema: createSessionSchema},async (request, reply)=> {
    const {plan} = request.query
    const session = await fastify.stripe.checkout.sessions.create({
      line_items: [
        {
          price: subscriptionProducts[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {trial_period_days: 30},
      success_url: getEnv('SITE_ADDRESS') + '/secure/payments/success',
      cancel_url: getEnv('SITE_ADDRESS') + '/secure/payments/cancel',
    });

    if(session.url)
      return {checkoutUrl: session.url}
    else
      reply.sendError({message: 'Could not get a URL for checkout', error: 'No checkout URL', statusCode: 500})
  })


}

export default PaymentPlugin
