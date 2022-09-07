import { OAuth2Namespace } from '@fastify/oauth2';


declare module 'fastify' {
  interface FastifyInstance {
    xeroOauth: OAuth2Namespace;
  }

  interface Session {
    // the id of the currently signed in user
    userId?: string
  }
}

export {}
