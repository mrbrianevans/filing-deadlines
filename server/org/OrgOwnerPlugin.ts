import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {Invite, OrgMemberStatus} from '../../fs-shared/OrgMemberStatus.js'
import {emailRegex} from '../../fs-shared/sharedRegex.js'


const inviteSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: {
        type:'string',
        // pattern: emailRegex.toString()
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
      reply.status(401).send({code: 401, message: 'You are not the owner of this organisation'})
      return
    }
    request.log = request.log.child({owner})
  })

  // invite user to org
  fastify.post<{Body: {email:string}}>('/invite', {schema: inviteSchema},async (request, reply)=>{
    const {email} = request.body
    const {orgId} = request.session
    const {user,org} = request
    const alreadyPending = await fastify.redis.hgetall(`invite:${email}`)
    if(alreadyPending?.orgId === orgId){
      return reply.status(400).send({message:"This user has already been invited to your organisation",errCode:'already-invited'})
    } else if(alreadyPending?.orgId) {
      return reply.status(400).send({message:"This user has already been invited to another organisation",errCode:'already-invited-elsewhere'})
    } else {
      const currentStatus = await fastify.redis.hget(`org:${orgId}:members`, email)
      // todo: this should also somehow check that the person isn't already a part of an organisation. Not sure how to do that with email.
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
        return reply.status(400).send({message:"This user is already a part of your organisation",errCode:'already-in-organisation'})
      }
    }
  })
}

export default OrgOwnerPlugin
