import type {FastifyPluginAsync} from "fastify";
import Stripe from 'stripe';
import { getEnv } from "../../backend-shared/utils.js";
import {SubscriptionPlans} from '../../fs-shared/SubscriptionPlans.js'

// these should maybe be in the database or in a .env file
const subscriptionProducts: Record<SubscriptionPlans, string> = {
  [SubscriptionPlans.BASIC]: getEnv('STRIPE_BASIC_PRICE'),
  [SubscriptionPlans.STANDARD]: getEnv('STRIPE_STANDARD_PRICE')
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
  const SITE_ADDRESS = getEnv('SITE_ADDRESS');

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
      metadata: {orgId: request.session.orgId},
      mode: 'subscription',
      subscription_data: {trial_period_days: 30},
      success_url: SITE_ADDRESS + '/secure/payments/success',
      cancel_url: SITE_ADDRESS + '/secure/payments/cancel',
    });

    if(session.url)
      return {checkoutUrl: session.url}
    else
      reply.sendError({message: 'Could not get a URL for checkout', error: 'No checkout URL', statusCode: 500})
  })

  // creates a billing portal session for a customer to manage their billing, view invoices etc.
  fastify.get('/portal-url', async (request, reply)=> {
    const session = await fastify.stripe.billingPortal.sessions.create({
      customer: '', // todo: get customer ID for the current user
      return_url: SITE_ADDRESS
    });

    if(session.url)
      return {portalUrl: session.url}
    else
      reply.sendError({message: 'Could not get a URL for billing portal', error: 'No billing portal URL', statusCode: 500})
  })


}

export default PaymentPlugin
