import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {randomUUID} from "crypto";
import {Invite, OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'


const createOrgSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: {type:'string', pattern: '^[a-zA-Z0-9-_ ]+$'}
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
    if(added === 0) return reply.sendError({message:'An organisation already exists with that name', error: 'Duplicate name', statusCode: 400})

    const orgId = randomUUID() // generate orgId
    request.session.orgId = orgId
    request.session.owner = true
    await fastify.redis.set(`org:${orgId}:name`, name)
    const {userId} = request.session
    await fastify.redis.set(`org:${orgId}:owner`, <string>userId)
    await fastify.redis.set(`user:${userId}:org`, orgId)
    const {user} = request
    await fastify.redis.hset(`org:${orgId}:members`, user.email, OrgMemberStatus.owner)
    await fastify.redis.sadd(`org:${orgId}:activeMembers`, request.session.userId)
    reply.status(204).send()
  })

  //  accept invite
  fastify.post<{Querystring: {orgId: string}}>('/acceptInvitation', {schema:acceptInviteSchema},async (request, reply)=>{
    const orgIdAccepted = request.query.orgId
    const {email} = request.user
    const {userId} = request.session
    const pendingInviteOrgId = await fastify.redis.hget(`invite:${email}`, 'orgId')
    if(orgIdAccepted === pendingInviteOrgId){
      // accept
      request.session.orgId = orgIdAccepted
      await fastify.redis.del(`invite:${email}`)
      await fastify.redis.set(`user:${userId}:org`, orgIdAccepted)
      await fastify.redis.hset(`org:${orgIdAccepted}:members`, email, OrgMemberStatus.acceptedInvite)
      await fastify.redis.sadd(`org:${orgIdAccepted}:activeMembers`, request.session.userId)
      reply.status(204).send()
    }else{
      reply.sendError({message: 'You\'ve been invited to a different organisation. Refresh the page and try again.', error:'Another invite', statusCode: 400})
    }
  })

  // reject invitation
  fastify.post<{Querystring: {orgId: string}}>('/rejectInvitation', {schema:acceptInviteSchema},async (request, reply)=>{
    const orgIdRejected = request.query.orgId
    const {email} = request.user
    const {userId} = request.session
    const pendingInviteOrgId = await fastify.redis.hget(`invite:${email}`, 'orgId')
    if(orgIdRejected === pendingInviteOrgId){
      await fastify.redis.del(`invite:${email}`)
      await fastify.redis.hset(`org:${orgIdRejected}:members`, email, OrgMemberStatus.rejectedInvite)
      reply.status(204).send()
    }else{
      reply.sendError({message: 'You\'ve been invited to a different organisation. Refresh the page and try again.', error:'Another invite', statusCode: 400})
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
