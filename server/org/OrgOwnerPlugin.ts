import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {Invite, OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'
import {emailRegex} from '../../fs-shared/sharedRegex.js'


const inviteSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: {
        type:'string',
        format: 'email' // needs testing
      }
    }
  }
}

const OrgOwnerPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.addHook('onRequest', async (request, reply)=> {
    const {owner,orgId,userId} = request.session
    // check ownership is legitimate
    const actualOwner = await fastify.redis.get(`org:${orgId}:owner`)
    if (!owner || userId !== actualOwner) {
      request.log.warn({sessionId: request.session.sessionId,owner,orgId,userId,actualOwner}, 'Rejecting request due to user not being the org owner')
      return reply.sendError({message: 'You are not the owner of this organisation, and only the owner can access this.', error: 'Ownership required', statusCode: 401})
    }
    request.log = request.log.child({owner})
  })

  await fastify.register(import('../plugins/PaymentPlugin.js'), {prefix: 'payments'})

  // invite user to org
  fastify.post<{Body: {email:string}}>('/invite', {schema: inviteSchema},async (request, reply)=>{
    const {email} = request.body
    const {orgId} = request.session
    const {user,org} = request
    const orgActiveMemberCount = await fastify.redis.scard(`org:${orgId}:activeMembers`)
    if(orgActiveMemberCount >= org.features.organisationMaxMembers){
      return reply.sendError({message: `Your organisations subscription plan includes ${org.features.organisationMaxMembers} members, and you already have ${orgActiveMemberCount} active members in your organisation.`, error: 'Reached limit', statusCode: 400})
    }
    const alreadyPending = await fastify.redis.hgetall(`invite:${email}`)
    if(alreadyPending?.orgId === orgId){
      return reply.sendError({message:"This user has already been invited to your organisation",error:'Already invited', statusCode: 400})
    } else if(alreadyPending?.orgId) {
      return reply.sendError({message:"This user has already been invited to another organisation",error:'Already invited elsewhere', statusCode: 400})
    } else {
      const currentStatus = await fastify.redis.hget(`org:${orgId}:members`, email)
      // todo: this should also somehow check that the person isn't already a part of another organisation. Not sure how to do that with email. Probably need a new redis key for "email:{userEmail}:id" = UUID user id
      if(!currentStatus || currentStatus === OrgMemberStatus.left || currentStatus === OrgMemberStatus.removed || currentStatus === OrgMemberStatus.rejectedInvite) {
        const invite: Invite = {
          orgId: <string>orgId,
          orgName: org.name,
          invitedByName: user.name,
          invitedOn: new Date().toISOString()
        }
        await fastify.redis.hset(`invite:${email}`, invite)
        await fastify.redis.hset(`org:${orgId}:members`, email, OrgMemberStatus.pendingInvite)
        reply.status(204).send()
      }else{
        return reply.sendError({message:"This user is already a part of your organisation",error:'Already in organisation', statusCode: 400})
      }
    }
  })
}

export default OrgOwnerPlugin
