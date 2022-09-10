import { OAuth2Namespace } from '@fastify/oauth2';
import type {IdToken} from "./token.js";


declare module 'fastify' {
  interface FastifyInstance {
    xeroOauth: OAuth2Namespace;
  }

  interface Session {
    // the id of the currently signed in user
    userId?: string

    // the id of the organisation that the user is a part of
    orgId?: string

    // whether the user is the owner of their organisation or not
    owner?: boolean
  }

  interface FastifyRequest{
    // this is only set on /user routes! is null elsewhere
    user: IdToken

    org: {name: string}
  }
}

export {}
