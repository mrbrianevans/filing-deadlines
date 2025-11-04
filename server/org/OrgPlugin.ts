import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {randomUUID} from "crypto";
import { OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'
import {addressSchema} from "./RegisteredAddressPlugin.js";
import { SubscriptionPlans } from "../../fs-shared/SubscriptionPlans.js";
import {getOrgPlan} from "../payments/stripe/handleSubscriptionUpdated.js";

const createOrgSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: {type:'string', pattern: '^[a-zA-Z0-9-_ ]+$'},
      address: addressSchema
    },
    required: ['name', 'address']
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
  fastify.post<{Body: {name:string, address: {postCode:string, addressLine1?: string}}}>('/', {schema: createOrgSchema},async (request, reply)=>{
    if(request.session.orgId) return reply.sendError({message: 'You are already apart of an organisation. You can\'t create a new one.', error: 'Already in organisation', statusCode: 400})
    const {name, address} = request.body
    //check name is unique
    const added = await fastify.redis.sadd('orgNames', name)
    if(added === 0) return reply.sendError({message:'An organisation already exists with that name', error: 'Duplicate name', statusCode: 400})

    const orgId = randomUUID() // generate orgId
    request.log.info({name,address,orgId}, 'Create new organisation '+name)
    request.session.orgId = orgId
    request.session.owner = true
    await fastify.redis.set(`org:${orgId}:name`, name)
    await fastify.redis.hset(`org:${request.session.orgId}:address`, address)
    const {userId} = request.session
    await fastify.redis.set(`org:${orgId}:owner`, <string>userId)
    await fastify.redis.set(`user:${userId}:org`, orgId)
    const {user} = request
    await fastify.redis.hset(`org:${orgId}:members`, user.email, OrgMemberStatus.owner)
    await fastify.redis.sadd(`org:${orgId}:activeMembers`, request.session.userId)

    //launch the new organisation into "demo" mode, which is like a pretrial. So they don't have to enter anything into Stripe before seeing the dashboards.
    await fastify.redis.set(`org:${orgId}:subscriptionPlan`, SubscriptionPlans.STANDARD)
    const activeUntil = new Date()
    activeUntil.setDate(activeUntil.getDate()+7) // 7 days pre-trial
    await fastify.redis.set(`org:${orgId}:subscriptionActiveUntil`, activeUntil.getTime()/1000)
    await fastify.redis.set(`org:${orgId}:subscriptionStatus`, 'evaluation')
    request.session.orgPlan = SubscriptionPlans.STANDARD
    return reply.status(204).send()
  })

  //  accept invite
  fastify.post<{Querystring: {orgId: string}}>('/acceptInvitation', {schema:acceptInviteSchema},async (request, reply)=>{
    const orgIdAccepted = request.query.orgId
    const {email} = request.user
    const {userId} = request.session
    const pendingInviteOrgId = await fastify.redis.hget(`invite:${email}`, 'orgId')
    if(orgIdAccepted === pendingInviteOrgId){
      // accept
      request.log.info({orgIdAccepted},'Accepted org invitation')
      request.session.orgId = orgIdAccepted
      request.session.orgPlan = await getOrgPlan(request.session.orgId)
      await fastify.redis.del(`invite:${email}`)
      await fastify.redis.set(`user:${userId}:org`, orgIdAccepted)
      await fastify.redis.hset(`org:${orgIdAccepted}:members`, email, OrgMemberStatus.acceptedInvite)
      await fastify.redis.sadd(`org:${orgIdAccepted}:activeMembers`, request.session.userId)
      return reply.status(204).send()
    }else{
      return reply.sendError({message: 'You\'ve been invited to a different organisation. Refresh the page and try again.', error:'Another invite', statusCode: 400})
    }
  })

  // reject invitation
  fastify.post<{Querystring: {orgId: string}}>('/rejectInvitation', {schema:acceptInviteSchema},async (request, reply)=>{
    const orgIdRejected = request.query.orgId
    const {email} = request.user
    const {userId} = request.session
    const pendingInviteOrgId = await fastify.redis.hget(`invite:${email}`, 'orgId')
    if(orgIdRejected === pendingInviteOrgId){
      request.log.info({orgIdRejected}, 'Rejected org invitation')
      await fastify.redis.del(`invite:${email}`)
      await fastify.redis.hset(`org:${orgIdRejected}:members`, email, OrgMemberStatus.rejectedInvite)
      return reply.status(204).send()
    }else{
      return reply.sendError({message: 'You\'ve been invited to a different organisation. Refresh the page and try again.', error:'Another invite', statusCode: 400})
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
