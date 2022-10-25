import type {FastifyPluginAsync} from "fastify";
import Stripe from 'stripe';
import { getEnv } from "../../backend-shared/utils.js";
import {SubscriptionPlans} from '../../fs-shared/SubscriptionPlans.js'


const PaymentPlugin: FastifyPluginAsync = async (fastify, opts) => {
  const SITE_ADDRESS = getEnv('SITE_ADDRESS');

  {
    const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {apiVersion: '2022-08-01'})
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
      reply.sendError({message: 'Could not get a URL for billing portal', error: 'No billing portal URL', statusCode: 500})
  })


}

export default PaymentPlugin
