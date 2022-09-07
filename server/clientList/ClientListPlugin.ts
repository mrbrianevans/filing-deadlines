import type {FastifyPluginAsync} from "fastify";
import type {ClientListItem} from '../../fs-shared/ClientList.js'

const ClientListPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // get the client list for the current user
  fastify.get('/', async (request, reply)=>{
    const clients = await fastify.redis.smembers('user:'+request.session.userId+':clientList')
    //client IDs are stored in a Redis Set
    return clients
  })

  // update the users entire client list
  fastify.put('/', async (request, reply)=>{

  })

  // add a single client by its company number
  fastify.put<{Body: {client: ClientListItem}}>('/addByCompanyNumber', async (request, reply)=>{
    const clientId = request.body.client.company_name
    await fastify.redis.sadd('user:'+request.session.userId+':clientList', clientId)
    //todo: also need to store the client details in a seperate key
    reply.status(200).send()
  })

  // add many clients by their company numbers
  fastify.put('/addManyByCompanyNumber', async (request, reply)=>{
    // similar to /addByCompanyNumber, but with a for loop
  })

  fastify.delete<{Body: {clientId: string}}>('/removeClient', async (request, reply)=>{
    const clientId = request.body.clientId
    await fastify.redis.srem('user:'+request.session.userId+':clientList', clientId)
    reply.status(200).send()
  })

}

export default ClientListPlugin
