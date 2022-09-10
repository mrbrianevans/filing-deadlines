import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {randomUUID} from "crypto";
import {Invite, OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'


const createOrgSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: {type:'string', pattern: '^[a-zA-Z\\d-_]+$'}
    }
  }
}

const acceptInviteSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      orgId: {type:'string'}
    }
  }
}

const OrgPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.addHook('onRequest', async (request, reply)=> {
    const {orgId} = request.session
    request.log = request.log.child({orgId})
  })

  await fastify.register(import('./OrgMemberPlugin.js'), {prefix: 'member'})

  //  create new org
  fastify.post<{Body: {name:string}}>('/', {schema: createOrgSchema},async (request, reply)=>{
    const {name} = request.body
    //check name is unique
    const added = await fastify.redis.sadd('orgNames', name)
    if(added === 0) return reply.status(400).send({message:'An organisation already exists with that name', errCode: 'duplicate-name'})

    const orgId = randomUUID() // generate orgId
    await fastify.redis.set(`org:${orgId}:name`, name)
    const {userId} = request.session
    await fastify.redis.set(`org:${orgId}:owner`, <string>userId)
    await fastify.redis.set(`user:${userId}:org`, orgId)
    const {user} = request
    await fastify.redis.hset(`org:${orgId}:members`, user.email, OrgMemberStatus.owner)
    reply.status(204).send()
  })

  //  accept invite
  fastify.put<{Querystring: {orgId: string}}>('/acceptInvitation', {schema:acceptInviteSchema},async (request, reply)=>{
    const orgIdAccepted = request.query.orgId
    const {email} = request.user
    const {userId} = request.session
    const pendingInviteOrgId = await fastify.redis.hget(`invite:${email}`, 'orgId')
    if(orgIdAccepted === pendingInviteOrgId){
      // accept
      await fastify.redis.del(`invite:${email}`)
      await fastify.redis.set(`user:${userId}:org`, orgIdAccepted)
      await fastify.redis.hset(`org:${orgIdAccepted}:members`, email, OrgMemberStatus.acceptedInvite)
      reply.status(204).send()
    }else{
      reply.status(400).send({message: 'You\'ve been invited to a different organisation. Try again.', errCode:'org-ids-different'})
    }
  })

  // get current pending invite
  fastify.get('/invites', async (request, reply)=>{
    const {email} = request.user
    const exists = await fastify.redis.exists(`invite:${email}`)
    if(exists) {
      const pendingInvite = await fastify.redis.hgetall(`invite:${email}`)
      return pendingInvite
    }else return null
  })
}

export default OrgPlugin
