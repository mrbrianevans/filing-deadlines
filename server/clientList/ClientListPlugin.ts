import type {FastifyPluginAsync, FastifySchema} from "fastify";
import { getCompanyProfileFromApi } from "../../backend-shared/companiesHouseApi/getCompanyProfile.js";
import { dispatchLoadFilingHistory } from "../../backend-shared/jobs/dispatchJobs.js";
import type {ClientListItem} from '../../fs-shared/ClientList.js'
import {sortClientList} from "../../fs-shared/ClientList.js";

const addClientSchema: FastifySchema = {
  body: {type: 'object', properties: {companyNumber: {type: 'string'}}}
}

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
  fastify.post<{Body: {companyNumber: string}}>('/', {schema: addClientSchema},async (request, reply)=>{
    const {companyNumber} = request.body
    const profile = await getCompanyProfileFromApi(companyNumber)
    if(profile) await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
    const client: ClientListItem = {company_number: companyNumber, added_on: new Date().toISOString(),company_name: profile?.company_name}
    const exists = await fastify.redis.hexists('user:'+request.session.userId+':clients', companyNumber)
    if(!exists){
      // new client, dispatch event to load filing history
      await dispatchLoadFilingHistory(companyNumber, 100, 'new-client-added')
    }
    await fastify.redis.hset('user:'+request.session.userId+':clients', companyNumber, JSON.stringify(client))
    reply.status(201).send()
  })

  fastify.delete<{Params: {companyNumber: string}}>('/:companyNumber', async (request, reply)=>{
    const {companyNumber} = request.params
    const exists = await fastify.redis.hexists('user:'+request.session.userId+':clients', companyNumber)
    if(!exists){
      reply.status(404).send({message: 'Not found'})
    }
    await fastify.redis.hdel('user:'+request.session.userId+':clients', companyNumber)
    reply.status(204).send()
  })

}

export default ClientListPlugin
