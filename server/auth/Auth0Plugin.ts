import type {FastifyPluginAsync} from "fastify";
import { getEnv } from '../../backend-shared/utils.js'
import {getUserFromIdToken,decodeAuth0AccessToken} from "../../backend-shared/jwtTokens.js";
import {getOrgPlan} from "../payments/stripe/handleSubscriptionUpdated.js";
import {doSignIn} from "./doSignIn.js";


const userScopes = ['openid', 'profile', 'email']
const redirectUrl = getEnv('SITE_ADDRESS') + '/api/sign-in/auth0/callback'

const Auth0Plugin: FastifyPluginAsync = async (fastify, opts) => {

  // @ts-ignore
  fastify.register(import("@fastify/oauth2"), {
    name: 'auth0',
    credentials: {
      client: {
        id: getEnv('AUTH0_CLIENT_ID'),
        secret: getEnv('AUTH0_CLIENT_SECRET')
      },
      auth: {
        authorizeHost: 'https://dev-filingdeadlines.eu.auth0.com', //todo: these should be env variables
        authorizePath: '/authorize',
        tokenHost: 'https://dev-filingdeadlines.eu.auth0.com',
        tokenPath: '/oauth/token'
      }
    },
    scope: userScopes,
    startRedirectPath: '/', // registers the route to redir user to
    callbackUri: redirectUrl
  })

  fastify.get('/callback', async function(request,reply){
    try{
      const {token} = await this.auth0.getAccessTokenFromAuthorizationCodeFlow(request)
      const {access_token, id_token,refresh_token} = token
      const accessToken = decodeAuth0AccessToken(access_token)
      const idToken = getUserFromIdToken(id_token)
      const redirectUrl = await doSignIn({accessToken, idToken, refresh_token, request, fastify, provider: 'auth0'})
      reply.redirect(redirectUrl)
    }catch (e) {
      // this can be triggered by state not matching, in which case, it's better to direct the user to the homepage than show the error.
      request.log.error(e, "Error signing user in with Auth0")
      reply.redirect('/')
    }
  })

}

export default Auth0Plugin

