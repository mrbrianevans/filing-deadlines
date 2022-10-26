import type {FastifyPluginAsync} from "fastify";
import { getEnv } from '../../backend-shared/utils.js'
import {decodeXeroAccessToken, getUserFromIdToken,decodeAuth0AccessToken} from "../../backend-shared/jwtTokens.js";
import {getOrgPlan} from "../payments/stripe/handleSubscriptionUpdated.js";


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
        authorizeHost: 'https://dev-filingdeadlines.eu.auth0.com',
        authorizePath: '/authorize',
        tokenHost: 'https://dev-filingdeadlines.eu.auth0.com',
        tokenPath: '/oauth/token'
      }
    },
    scope: userScopes,
    startRedirectPath: '/', // registers the route to redir user to
    callbackUri: redirectUrl
  })

  //todo: refactor this logic into a generic "handleOauthLogin" function
  fastify.get('/callback', async function(request,reply){
    try{
      const {token} = await this.auth0.getAccessTokenFromAuthorizationCodeFlow(request)
      const {access_token, id_token,refresh_token} = token
      const decodedAccessToken = decodeAuth0AccessToken(access_token)
      const decodedIdToken = getUserFromIdToken(id_token)
      request.session.userId = decodedIdToken.userId
      request.log.info({userId: request.session.userId}, 'User logged in with Auth0')
      // this could be improved by storing the user id token as a hash. would require converting some non-string fields. or could be stored as stringified JSON.
      await fastify.redis.set('user:'+request.session.userId+':id', id_token)
      await fastify.redis.set('user:'+request.session.userId+':access_token', access_token)
      if(refresh_token) await fastify.redis.set('user:'+request.session.userId+':refresh_token', refresh_token)
      request.session.orgId = <string>await fastify.redis.get(`user:${request.session.userId}:org`)
      if(request.session.orgId) {
        request.session.owner = await fastify.redis.get(`org:${request.session.orgId}:owner`).then(o => o === request.session.userId)
        request.session.orgPlan = await getOrgPlan(request.session.orgId)
        if(request.session.owner) return reply.redirect('/secure/manage-organisation')
        else if(!request.session.orgPlan) return reply.redirect('/view/pricing')
        else {
          // if the user already has a client list, show them the dashboard. Otherwise, send them to make a client list.
          const clientListLength = await fastify.redis.hlen('org:' + request.session.orgId + ':clients')
          if (clientListLength > 0) reply.redirect('/secure/dashboard')
          else reply.redirect('/secure/clients')
        }
      }else{
        // if there is a pending invite, send the user to a special page for accepting the invite.
        const pendingInvite = await fastify.redis.exists(`invite:${decodedIdToken.email}`)
        if(pendingInvite) return reply.redirect('/secure/org-invite')
        else return reply.redirect('/secure/manage-organisation') // the user isn't in an org and doesn't have an invite, so let them create an org
      }
    }catch (e) {
      // this can be triggered by state not matching, in which case, it's better to direct the user to the homepage than show the error.
      request.log.error(e, "Error signing user in with Auth0")
      reply.redirect('/')
    }
  })

}

export default Auth0Plugin

