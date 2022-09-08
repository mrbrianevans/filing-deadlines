import type {FastifyPluginAsync} from "fastify";
import { getCompanyProfileFromApi } from "../../backend-shared/getCompanyProfile.js";
import type {ClientListItem} from '../../fs-shared/ClientList.js'
import {sortClientList} from "../../fs-shared/ClientList.js";

const ClientListPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // get the client list for the current user
  fastify.get('/', async (request, reply)=>{
    const clients = await fastify.redis.hgetall('user:'+request.session.userId+':clients')
    //client IDs are stored in a Redis Hash of id => JSON([Object Client])
    const clientListItems = Object.values(clients).map(c=><ClientListItem>JSON.parse(c)).sort(sortClientList)
    return clientListItems
  })

  // update the users entire client list
  fastify.put<{Body: ClientListItem[]}>('/', async (request, reply)=>{
    const newClientList = request.body
    const clientList = Object.fromEntries(newClientList.map(c=>[c.company_number, JSON.stringify(c)]))
    await fastify.redis.hset('user:'+request.session.userId+':clients', clientList)
  })

  // add a single client by its company number
  fastify.put<{Params: {clientId: string}}>('/:clientId', async (request, reply)=>{
    const {clientId} = request.params
    const profile = await getCompanyProfileFromApi(clientId)
    if(profile) await fastify.redis.set(`company:${clientId}:profile`, JSON.stringify(profile))
    const client: ClientListItem = {company_number: clientId, date_added: new Date().toISOString().split('T')[0],company_name: profile?.company_name}
    await fastify.redis.hset('user:'+request.session.userId+':clients', clientId, JSON.stringify(client))
    reply.status(201).send()
  })

  // add many clients by their company numbers
  fastify.put('/addManyByCompanyNumber', async (request, reply)=>{
    // similar to /addByCompanyNumber, but with a for loop
   reply.status(501).send({message:'Not implemented'})
  })

  fastify.delete<{Params: {clientId: string}}>('/:clientId', async (request, reply)=>{
    const {clientId} = request.params
    await fastify.redis.hdel('user:'+request.session.userId+':clients', clientId)
    reply.status(204).send()
  })

}

export default ClientListPlugin
