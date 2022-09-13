import type {FastifyPluginAsync, FastifySchema} from "fastify";
import { getCompanyProfileFromApi } from "../../backend-shared/companiesHouseApi/getCompanyProfile.js";
import {
  dispatchLoadFilingHistory,
  dispatchReloadClientListDetails,
  dispatchReloadClientListDetailsSync
} from "../../backend-shared/jobs/dispatchJobs.js";
import type {ClientListItem} from '../../fs-shared/ClientList.js'
import {sortClientList} from "../../fs-shared/ClientList.js";

const addClientSchema: FastifySchema = {
  body: {type: 'object', properties: {companyNumber: {type: 'string'}}}
}
//todo: the client list key needs to be changed from user:userId:clients to org:orgId:clients, and the plugin needs to move behind org/member to ensure only org members can edit client list.
const ClientListPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // get the client list for the current user
  fastify.get('/', async (request, reply)=>{
    const clients = await fastify.redis.hgetall(`org:${request.session.orgId}:clients`)
    //client IDs are stored in a Redis Hash of id => JSON([Object Client])
    const clientListItems = Object.values(clients).map(c=><ClientListItem>JSON.parse(c)).sort(sortClientList)
    return clientListItems
  })

  // update the users entire client list: disabled for the moment
  fastify.put<{Body: ClientListItem[]}>('/', {},async (request, reply)=>{
    const newClientList = request.body
    const clientList = Object.fromEntries(newClientList.map(c=>[c.company_number, JSON.stringify(c)]))
    await fastify.redis.hset(`org:${request.session.orgId}:clients`, clientList)
  })

  // add a single client by its company number. Company profile is loaded synchronously, but filing history is asynchronous.
  fastify.post<{Body: {companyNumber: string}}>('/', {schema: addClientSchema},async (request, reply)=>{
    const {companyNumber} = request.body
    const exists = await fastify.redis.hexists(`org:${request.session.orgId}:clients`, companyNumber)
    if(!exists){
      const profile = await getCompanyProfileFromApi(companyNumber)
      if(profile) await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
      const client: ClientListItem = {company_number: companyNumber, added_on: new Date().toISOString(),company_name: profile?.company_name, company_status: profile?.company_status}
      await fastify.redis.hset(`org:${request.session.orgId}:clients`, companyNumber, JSON.stringify(client))
      // new client, dispatch event to load filing history asynchronously
      await dispatchLoadFilingHistory(companyNumber, 100, 'new-client-added')
      reply.status(201).send()
    }else{
      reply.status(204).send({message:'Client was already on your client list'})
    }
  })

  fastify.delete<{Params: {companyNumber: string}}>('/:companyNumber', async (request, reply)=>{
    const {companyNumber} = request.params
    const exists = await fastify.redis.hexists(`org:${request.session.orgId}:clients`, companyNumber)
    if(!exists){
      reply.sendError({message: 'Could not find company to delete in your client list', error: 'Not found', statusCode: 404})
    }
    await fastify.redis.hdel(`org:${request.session.orgId}:clients`, companyNumber)
    // remove company profile and filing history
    await fastify.redis.del('company:'+companyNumber+':profile')
    await fastify.redis.del('company:'+companyNumber+':filingHistory')
    reply.status(204).send()
  })

  fastify.get('/reloadDetails',async (request, reply)=>{
    // waits synchronously for job to finish before return a response to the request. Max timeout of 10 seconds.
    const output = await dispatchReloadClientListDetailsSync(request.session.orgId, 'reloadDetails-endpoint-ClientListPlugin', 10_000)
    reply.status(204).send()
  })
}

export default ClientListPlugin
