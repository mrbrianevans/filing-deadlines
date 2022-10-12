import type {FastifyPluginAsync} from "fastify";
import Stripe from 'stripe';
import { getEnv } from "../../backend-shared/utils";


const PaymentPlugin: FastifyPluginAsync = async (fastify, opts) => {

  const stripe = new Stripe('sk_test_...', {apiVersion: '2022-08-01'})
  fastify.decorate('stripe', stripe)

  fastify.post('/create-session', async (request, reply)=> {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Basic plan',
            },
            unit_amount: 500, // get this dynamically from stripe
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: getEnv('SITE_ADDRESS') + '/secure/payments/success',
      cancel_url: getEnv('SITE_ADDRESS') + '/secure/payments/cancel',
    });

    if(session.url)
      reply.redirect(303, session.url);
  })


}

export default PaymentPlugin
