import type {FastifyPluginAsync} from "fastify";
import jwtDecode from "jwt-decode";
import type { User } from "../../fs-shared/User.js";
import type { IdToken } from "../types/token.js";

const UserPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.addHook('onRequest', async (request, reply)=> {
    const {userId} = request.session
    // ensure user is logged in (if userId is set on the session, then they are logged in)
    if (!userId) {
      request.log.warn({sessionId: request.session.sessionId}, 'Rejecting request due to user not logged in')
      reply.status(401).send({code: 401, message: 'Not logged in'})
      return
    }
    request.log = request.log.child({userId})
  })

  await fastify.register(import("../clientList/ClientListPlugin.js"), {prefix: 'client-list'}) // register endpoints relating to client list

  fastify.get('/', async (request, reply) => {
    const userId = request.session.userId
    if(!userId) {
      request.log.debug('Requested user profile, but userId not found on session')
      return null
    }
    else{
      // get user from Redis and return
      const id_token = await fastify.redis.get('user:'+request.session.userId+':id')
      if(!id_token) {
        request.log.debug('Requested user profile, and userId exists, but couldn\'t find ID token in Redis')
        return null
      }
      const decodedIdToken = jwtDecode(id_token) as IdToken
      const user: User = {
        id: decodedIdToken.xero_userid,
        name: decodedIdToken.name,
        email: decodedIdToken.email
      }
      return user
    }
  })

  fastify.get('/logout', async (request, reply)=>{
      await request.session.destroy()
      reply.redirect('/')
  })
}

export default UserPlugin
