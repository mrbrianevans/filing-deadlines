import {getOrgPlan} from "../payments/stripe/handleSubscriptionUpdated.js";
import type {AccessToken, IdTokenUser} from "../../backend-shared/jwtTokens.js";
import type {FastifyInstance, FastifyRequest} from "fastify";


interface DoSignInProps{
  /** the decoded access token */
  accessToken: AccessToken,
  /** the decoded ID token JSON object */
  idToken: IdTokenUser,
  /** the fastify request object, used for modifying the session */
  request: FastifyRequest,
  /** the fastify instance, used for access redis */
  fastify: FastifyInstance,
  /** the oauth provider, eg Xero or Auth0. */
  provider: string,
  /** if a refresh token was sent, it will be stored in redis */
  refresh_token?: string
}

/**
 * The logic for performing a login in the oauth callback. This is generic to any specific oauth provider.
 * @returns the path to redirect the user to
 */
export async function doSignIn ({accessToken, idToken, request, fastify, provider, refresh_token}: DoSignInProps) {
  request.session.userId = idToken.userId
  request.log.info({userId: request.session.userId}, 'User logged in with %s', provider)
  const userIdAlreadyRegistered =  await fastify.redis.get('email:'+idToken.email+':userId')
  if(!userIdAlreadyRegistered) await fastify.redis.set('user:'+request.session.userId+':signUpDate', new Date().toISOString())
  else if(userIdAlreadyRegistered !== request.session.userId) throw new Error('User tried to sign in with a different user id but the same email address')
  await fastify.redis.set('email:'+idToken.email+':userId', request.session.userId)
  await fastify.redis.set('user:'+request.session.userId+':authProvider', provider)
  await fastify.redis.set('user:'+request.session.userId+':idProfile', JSON.stringify(idToken))
  await fastify.redis.set('user:'+request.session.userId+':accessToken', JSON.stringify(accessToken))
  if(refresh_token) await fastify.redis.set('user:'+request.session.userId+':refresh_token', refresh_token)
  request.session.orgId = <string>await fastify.redis.get(`user:${request.session.userId}:org`)
  if(request.session.orgId) {
    request.session.owner = await fastify.redis.get(`org:${request.session.orgId}:owner`).then(o => o === request.session.userId)
    request.session.orgPlan = await getOrgPlan(request.session.orgId)
    if(request.session.owner) return '/secure/manage-organisation'
    else if(!request.session.orgPlan) return '/view/pricing'
    else {
      // if the user already has a client list, show them the dashboard. Otherwise, send them to make a client list.
      const clientListLength = await fastify.redis.hlen('org:' + request.session.orgId + ':clients')
      if (clientListLength > 0) return '/secure/dashboard'
      else return '/secure/clients'
    }
  }else{
    // if there is a pending invite, send the user to a special page for accepting the invite.
    const pendingInvite = await fastify.redis.exists(`invite:${idToken.email}`)
    if(pendingInvite) return '/secure/org-invite'
    else return '/secure/manage-organisation' // the user isn't in an org and doesn't have an invite, so let them create an org
  }
}
