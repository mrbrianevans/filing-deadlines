import type {FastifyPluginAsync} from "fastify";
import type { User } from "../../fs-shared/User.js";
import { getUserFromIdToken } from "../../backend-shared/jwtTokens.js";

const UserPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', async (request, reply)=> {
    const {userId} = request.session
    // ensure user is logged in (if userId is set on the session, then they are logged in)
    if (!userId) {
      request.log.warn({sessionId: request.session.sessionId}, 'Rejecting request due to user not logged in')
      reply.sendError({statusCode: 401, message: 'You need to be logged in to access this', error: 'Not logged in'})
      return
    }
    const idToken = await fastify.redis.get(`user:${userId}:id`)
    if(!idToken) {
      request.log.warn('userId exists, but couldn\'t find ID token in Redis')
      reply.sendError({statusCode: 401, error: 'Issue with account', message: 'There is an issue with your account. Try logging out and then sign in again.'})
      return null
    }
    request.user = getUserFromIdToken(idToken)
    request.log = request.log.child({userId})
  })

  await fastify.register(import('../org/OrgPlugin.js'), {prefix: 'org'}) // organisation management
  await fastify.register(import('../companyData/CompanyDataPlugin.js'), {prefix: 'company'}) // company data
  await fastify.register(import('./FeatureRequestPlugin.js'), {prefix: 'feature-request'}) // feature requests


  fastify.get('/', async (request, reply) => {
    const decodedIdToken = request.user
    const user: User = {
      id: decodedIdToken.xero_userid,
      name: decodedIdToken.name,
      email: decodedIdToken.email,
      owner: request.session.owner
    }
    if(request.session.orgId) user.orgName = <string>await fastify.redis.get(`org:${request.session.orgId}:name`)
    return user
  })

  fastify.get('/logout', async (request, reply)=>{
    await request.session.destroy()
    reply.redirect('/')
  })
}

export default UserPlugin
