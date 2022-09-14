import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {Invite, OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'



const OrgMemberPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorateRequest('org', null)
  fastify.addHook('onRequest', async (request, reply)=> {
    const {orgId,userId} = request.session
    // check ownership is legitimate
    if (!orgId) {
      request.log.warn({sessionId: request.session.sessionId,orgId}, 'Rejecting request due to user not being an org member')
      reply.sendError({statusCode: 401, error: 'Not in organisation', message: 'You are not a member of this organisation, but membership is required to access this. If you think this is a mistake, try logging out and signing in again.'})
      return
    }else{
      const actualOrg = await fastify.redis.get(`user:${userId}:org`)
      if(actualOrg !== orgId){
        request.log.warn({sessionOrgId: orgId, redisOrgId: actualOrg}, 'OrgId in session does not match OrgId in Redis')
        reply.sendError({statusCode: 401, error: 'Out of sync', message: 'There has been a problem with your membership of this organisation. Please log out and sign in again and retry.'})
      }
    }
    const name = <string>await fastify.redis.get(`org:${orgId}:name`)
    request.org = {name} // ideally there should be a hash containing a field called name, rather than a key like this
    request.log = request.log.child({orgId})
  })

  await fastify.register(import('./OrgOwnerPlugin.js'), {prefix: 'owner'}) // secure endpoints only for the owner
  await fastify.register(import("./ClientListPlugin.js"), {prefix: 'client-list'}) // register endpoints relating to client list
  await fastify.register(import('../dashboardData/DashboardDataPlugin.js'), {prefix: 'dashboard-data'}) // dashboard data
  await fastify.register(import('../dashboardData/ConfirmationStatementsDataPlugin.js'), {prefix: 'confirmation-statement'}) // dashboard data
  await fastify.register(import('../dataPlugins/recentFilings/RecentFilingsPlugin.js'), {prefix: 'recent-filings'}) // recent filings data

  fastify.get('/members', async (request, reply)=> {
    return await fastify.redis.hgetall(`org:${request.session.orgId}:members`)
  })

}

export default OrgMemberPlugin
