import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {Invite, OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'



const OrgMemberPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.addHook('onRequest', async (request, reply)=> {
    const {orgId,userId} = request.session
    // check ownership is legitimate
    if (!orgId) {
      request.log.warn({sessionId: request.session.sessionId,orgId}, 'Rejecting request due to user not being the org owner')
      reply.status(401).send({code: 401, message: 'You are not the owner of this organisation'})
      return
    }else{
      const actualOrg = await fastify.redis.get(`user:${userId}:org`)
      if(actualOrg !== orgId){
        request.log.warn({sessionOrgId: orgId, redisOrgId: actualOrg}, 'OrgId in session does not match OrgId in Redis')
        reply.status(401).send({code: 401, message: 'There has been a problem with your membership of this organisation.'})
      }
    }
    request.log = request.log.child({orgId})
  })

  await fastify.register(import('./OrgOwnerPlugin.js'), {prefix: 'owner'})

  fastify.get('/name', async (request, reply)=> {
    return await fastify.redis.get(`org:${request.session.orgId}:name`)
  })

  fastify.get('/members', async (request, reply)=> {
    return await fastify.redis.hgetall(`org:${request.session.orgId}:members`)
  })

}

export default OrgMemberPlugin
