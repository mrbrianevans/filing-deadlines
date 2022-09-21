import type {FastifyPluginAsync} from "fastify";
import { getEnv } from '../../backend-shared/utils.js'
import {decodeAccessToken, getUserFromIdToken} from "../../backend-shared/jwtTokens.js";

const userScopes = ['openid', 'profile', 'email']
const redirectUrl = getEnv('XERO_REDIRECT_URL')

const SignInWithXeroPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // @ts-ignore
  fastify.register(import("@fastify/oauth2"), {
    name: 'xeroOauth',
    credentials: {
      client: {
        id: getEnv('XERO_CLIENT_ID'),
        secret: getEnv('XERO_CLIENT_SECRET')
      },
      auth: {
        authorizeHost: 'https://login.xero.com',
        authorizePath: '/identity/connect/authorize',
        tokenHost: 'https://identity.xero.com',
        tokenPath: '/connect/token'
      }
    },
    scope: userScopes,
    startRedirectPath: '/', // registers the route to redir user to
    callbackUri: redirectUrl
  })

  fastify.get('/callback', async function(request,reply){
    try{
      const {token} = await this.xeroOauth.getAccessTokenFromAuthorizationCodeFlow(request)
      const {access_token, id_token,refresh_token} = token
      const decodedAccessToken = decodeAccessToken(access_token)
      const decodedIdToken = getUserFromIdToken(id_token)
      request.session.userId = decodedIdToken.xero_userid
      request.log.info({userId: request.session.userId}, 'User logged in with Xero')
      // this could be improved by storing the user id token as a hash. would require converting some non-string fields. or could be stored as stringified JSON.
      await fastify.redis.set('user:'+request.session.userId+':id', id_token)
      await fastify.redis.set('user:'+request.session.userId+':access_token', access_token)
      if(refresh_token) await fastify.redis.set('user:'+request.session.userId+':refresh_token', refresh_token)
      request.session.orgId = <string>await fastify.redis.get(`user:${request.session.userId}:org`)
      if(request.session.orgId) {
        request.session.owner = await fastify.redis.get(`org:${request.session.orgId}:owner`).then(o => o === request.session.userId)
        // if the user already has a client list, show them the dashboard. Otherwise, send them to make a client list.
        const clientListLength = await fastify.redis.hlen('org:'+request.session.orgId+':clients')
        if(clientListLength > 0) reply.redirect('/dashboard')
        else reply.redirect('/clients')
      }else{
        // if there is a pending invite, send the user to a special page for accepting the invite.
        const pendingInvite = await fastify.redis.exists(`invite:${decodedIdToken.email}`)
        if(pendingInvite) return reply.redirect('/org-invite')
        else return reply.redirect('/manage-organisation') // the user isn't in an org and doesn't have an invite, so let them create an org
      }
    }catch (e) {
      // this can be triggered by state not matching, in which case, it's better to direct the user to the homepage than show the error.
      request.log.error(e, "Error signing user in with Xero")
      reply.redirect('/')
    }
  })

}


export default SignInWithXeroPlugin
