import type {FastifyPluginAsync, FastifySchema} from "fastify";
import Stripe from 'stripe';
import { getEnv } from "../../backend-shared/utils.js";
import {SubscriptionPlans} from '../../fs-shared/SubscriptionPlans.js'
// import billingPortalConfiguration from '../payments/stripe/billingPortalConfiguration.json' assert {type:'json'}
import assert from "assert";

const getCheckoutSessionSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      checkoutSessionId: {type:'string'}
    },
    required: ['checkoutSessionId']
  }
}

const PaymentPlugin: FastifyPluginAsync = async (fastify, opts) => {
  const SITE_ADDRESS = getEnv('SITE_ADDRESS');

  {
    const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {apiVersion: '2022-11-15'})
    fastify.decorate('stripe', stripe)
  }

  // creates a billing portal session for a customer to manage their billing, view invoices etc.
  fastify.get('/portal-url', async (request, reply)=> {
    const customer = await fastify.redis.get(`user:${request.session.userId}:customerId`)
    if(!customer) return reply.sendError({message: 'You haven\'t signed up for payments with Stripe yet, so you can\'t manage Stripe billing.', error: 'Not connected with Stripe', statusCode: 500})
    const session = await fastify.stripe.billingPortal.sessions.create({
      customer,
      return_url: SITE_ADDRESS + '/secure/manage-organisation'
    });

    if(session.url)
      return {portalUrl: session.url}
    else
      return reply.sendError({message: 'Could not get a URL for billing portal', error: 'No billing portal URL', statusCode: 500})
  })

  fastify.get<{Querystring: {checkoutSessionId: string}}>('/checkout-session', {schema: getCheckoutSessionSchema},async (request, reply)=> {
    const {checkoutSessionId} = request.query
    const checkoutSession = await fastify.stripe.checkout.sessions.retrieve(checkoutSessionId)
    if(checkoutSession.client_reference_id !== request.session.userId)
      return reply.sendError({statusCode: 401, error: 'Wrong checkout id', message: 'This checkout session belongs to another user.'})
    const {status, amount_total} = checkoutSession
    return {
      status, amount_total
    }
  })

  // used by client to show embedded pricing table
  fastify.get('/public', async (request, reply)=> {
    return {
      pricingTableId: getEnv('STRIPE_PRICING_TABLE_ID'),
      stripePublicKey: getEnv('STRIPE_PUBLIC_KEY')
    }
  })

}

export default PaymentPlugin
