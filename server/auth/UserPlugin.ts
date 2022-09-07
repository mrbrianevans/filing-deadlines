import {FastifyPluginAsync} from "fastify";


const UserPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const user = request.session.userId
    if(!user) return null
    else{
      // get user from Redis and return
      return {user}
    }
  })
}

export default UserPlugin
