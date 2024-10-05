import type {FastifyPluginAsync} from "fastify";
import type { User } from "../../fs-shared/User.js";

const UserPlugin: FastifyPluginAsync = async (fastify, opts) => {
  // @ts-ignore this is checked to not be null in the onRequest hook before its accessed in the handlers
  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', async (request, reply)=> {
    const {userId} = request.session
    // ensure user is logged in (if userId is set on the session, then they are logged in)
    if (!userId) {
      request.log.warn({sessionId: request.session.sessionId}, 'Rejecting request due to user not logged in')
      return reply.sendError({statusCode: 401, message: 'You need to be logged in to access this', error: 'Not logged in'})
    }
    const idProfile = await fastify.redis.get(`user:${userId}:idProfile`).then(i=>i ? JSON.parse(i) : null)
    if(!idProfile) {
      request.log.warn('userId exists, but couldn\'t find ID token profile in Redis')
      return reply.sendError({statusCode: 401, error: 'Issue with account', message: 'There is an issue with your account. Try logging out and then sign in again.'})
    }
    request.user = idProfile
    request.log = request.log.child({userId})
  })

  await fastify.register(import('../org/OrgPlugin.js'), {prefix: 'org'}) // organisation management
  await fastify.register(import('../companyData/CompanyDataPlugin.js'), {prefix: 'company'}) // general company data
  await fastify.register(import('../plugins/FeedbackPlugin.js'), {prefix: 'feedback'}) // eg: feature requests


  fastify.get('/', async (request, reply) => {
    const user: User = {
      id: request.user.userId,
      name: request.user.name,
      email: request.user.email,
      owner: request.session.owner,
      orgPlan: request.session.orgPlan
    }
    if(request.session.orgId) user.orgName = <string>await fastify.redis.get(`org:${request.session.orgId}:name`)
    return user
  })

  fastify.get('/logout', async (request, reply)=>{
    fastify.log.info('User logged out')
    await request.session.destroy()
    return reply.redirect('/')
  })
}

export default UserPlugin
