import type { OAuth2Namespace } from '@fastify/oauth2';
import type {IdToken} from "./token.js";
import type {CustomFastifyError} from "./CustomFastifyError.js";
import type {Stripe} from "stripe";
import type { SubscriptionPlans,Features } from "../../fs-shared/SubscriptionPlans.js";


declare module 'fastify' {
  interface FastifyInstance {
    xeroOauth: OAuth2Namespace;
    stripe: Stripe
  }

  // these variables can be undefined, but they are checked in pre-handler
  interface Session {
    // the id of the currently signed in user
    userId: string

    // the id of the organisation that the user is a part of
    orgId: string

    // whether the user is the owner of their organisation or not
    owner?: boolean

    // the subscription plan of the organisation that the user is in
    orgPlan?: SubscriptionPlans
  }

  interface FastifyRequest{
    // this is only set on /user routes! is null elsewhere
    user: IdToken

    org: {name: string, features: Features}
  }

  interface FastifyReply{
    // send an error response
    sendError(error: CustomFastifyError): void
  }
}

export {}
