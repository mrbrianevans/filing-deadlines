import type {FastifyPluginAsync, FastifySchema} from "fastify";
import { getCompanyProfileFromApi } from "../../backend-shared/companiesHouseApi/getCompanyProfile.js";
import {
  dispatchLoadFilingHistoryForCompany,
  dispatchReloadClientListDetails,
  dispatchReloadClientListDetailsSync
} from "../../backend-shared/jobs/dispatchJobs.js";
import type {ClientListItem} from '../../fs-shared/ClientList.js'
import {sortClientList} from "../../fs-shared/ClientList.js";

const addClientSchema: FastifySchema = {
  body: {type: 'object', properties: {companyNumber: {type: 'string', minLength: 6, maxLength: 8}}}
}
const addManyClientsSchema: FastifySchema = {
  body: {type:'array', items: {type: 'string', minLength: 6, maxLength: 8}}
}

const ClientListPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // get the client list for the current user
  fastify.get('/', async (request, reply)=>{
    const clients = await fastify.redis.hgetall(`org:${request.session.orgId}:clients`)
    //client IDs are stored in a Redis Hash of companyNumber => JSON([Object Client])
    const clientListItems = Object.values(clients).map(c=><ClientListItem>JSON.parse(c)).sort(sortClientList)
    return clientListItems
  })

  fastify.get('/count', async (request, reply)=>{
    const numberOfClients = await fastify.redis.hlen(`org:${request.session.orgId}:clients`)
    return numberOfClients
  })

  // add a single client by its company number. Company profile is loaded synchronously, but filing history is asynchronous.
  fastify.post<{Body: {companyNumber: string}}>('/', {schema: addClientSchema},async (request, reply)=>{
    const companyNumber = request.body.companyNumber.trim().padStart(8, '0')
    const currentClientListSize = await fastify.redis.hlen(`org:${request.session.orgId}:clients`)
    request.log.info({companyNumber, currentClientListSize}, 'Add company number to client list')
    if(currentClientListSize >= request.org.features.clientListMaxSize)
      return reply.sendError({message: 'You have reached the maximum client list size available in your subscription plan', error: 'Client list full', statusCode: 403})
    const exists = await fastify.redis.hexists(`org:${request.session.orgId}:clients`, companyNumber)
    if(!exists){
      await fastify.redis.sadd(`company:${companyNumber}:clientLists`, request.session.orgId)
      const profile = await getCompanyProfileFromApi(companyNumber)
      if(profile) await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
      const client: ClientListItem = {company_number: companyNumber, added_on: new Date().toISOString(),company_name: profile?.company_name, company_status: profile?.company_status}
      await fastify.redis.hset(`org:${request.session.orgId}:clients`, companyNumber, JSON.stringify(client))
      // new client, dispatch event to load filing history asynchronously
      await dispatchLoadFilingHistoryForCompany(companyNumber, 100, 'new-client-added')
      reply.status(201).send()
    }else{
      reply.status(204).send({message:'Client was already on your client list'})
    }
  })

  fastify.post<{Body: string[]}>('/addMany', {schema: addManyClientsSchema},async (request, reply)=>{
    const companyNumbers = request.body.map(companyNumber=>companyNumber.trim().padStart(8, '0'))
    const currentClientListSize = await fastify.redis.hlen(`org:${request.session.orgId}:clients`)
    request.log.info({companyNumbers: companyNumbers.length, currentClientListSize}, 'User uploaded client list')
    if(currentClientListSize + companyNumbers.length > request.org.features.clientListMaxSize)
      return reply.sendError({message: 'You have reached the maximum client list size available in your subscription plan', error: 'Client list full', statusCode: 403})
    let successCount = 0
    for (const companyNumber of companyNumbers) {
      const added = await fastify.redis.sadd(`company:${companyNumber}:clientLists`, request.session.orgId).then(res=>res === 1)
      if(added){
        const profile = await getCompanyProfileFromApi(companyNumber)
        if(profile) {
          await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
          const client: ClientListItem = {company_number: companyNumber, added_on: new Date().toISOString(),company_name: profile?.company_name, company_status: profile?.company_status}
          await fastify.redis.hset(`org:${request.session.orgId}:clients`, companyNumber, JSON.stringify(client))
          // new client, dispatch event to load filing history asynchronously
          await dispatchLoadFilingHistoryForCompany(companyNumber, 100, 'new-client-added')
          successCount++
        }
      }
    }
    const newClientListSize = await fastify.redis.hlen(`org:${request.session.orgId}:clients`)
    request.log.info({successCount,newClientListSize,previousClientListSize:currentClientListSize}, 'Added %i companies to client list in bulk', successCount)
    return {successCount}
  })

  fastify.delete<{Params: {companyNumber: string}}>('/:companyNumber', async (request, reply)=>{
    const {companyNumber} = request.params
    const exists = await fastify.redis.hexists(`org:${request.session.orgId}:clients`, companyNumber)
    request.log.info({companyNumber, existsInClientList:exists}, "Deleting company from client list")
    if(!exists){
      return reply.sendError({message: 'Could not find company to delete in your client list', error: 'Not found', statusCode: 404})
    }
    await fastify.redis.srem(`company:${companyNumber}:clientLists`, request.session.orgId) // remove org from company tracking list
    await fastify.redis.hdel(`org:${request.session.orgId}:clients`, companyNumber) // remove company from org client list
    // remove filings from Sorted Set of recent filings
    const filings = await fastify.redis.hkeys(`company:${companyNumber}:filingHistory`)
    if(filings.length) await fastify.redis.zrem(`org:${request.session.orgId}:clientFilings`, filings.map(f=>`${companyNumber}:${f}`))
    // remove company profile and filing history if the company isn't in any clientLists anymore.
    if(await fastify.redis.scard(`company:${companyNumber}:clientLists`) === 0) {
      await fastify.redis.del('company:' + companyNumber + ':profile')
      await fastify.redis.del('company:' + companyNumber + ':filingHistory')
    }
    reply.status(204).send()
  })

  fastify.delete('/', async (request, reply)=>{
    request.log.info("Deleting all companies from client list")
    //for each company in client list
    const companies = await fastify.redis.hkeys(`org:${request.session.orgId}:clients`)
    for(const companyNumber of companies){
      await fastify.redis.srem(`company:${companyNumber}:clientLists`, request.session.orgId) // remove org from company tracking list
      if(await fastify.redis.scard(`company:${companyNumber}:clientLists`) === 0) {
        await fastify.redis.del('company:' + companyNumber + ':profile')
        await fastify.redis.del('company:' + companyNumber + ':filingHistory')
      }
    }
    // remove organisations client list and client filings altogether
    await fastify.redis.del(`org:${request.session.orgId}:clients`)
    await fastify.redis.del(`org:${request.session.orgId}:clientFilings`)
    request.log.info({countOfDeleted: companies.length}, "Deleted %i companies from client list", companies.length)
    reply.status(204).send()
  })

  fastify.get('/reloadDetails',async (request, reply)=>{
    request.log.info('User requested reload of client list details')
    // waits synchronously for job to finish before return a response to the request. Max timeout of 10 seconds.
    const output = await dispatchReloadClientListDetailsSync(request.session.orgId, 'reloadDetails-endpoint-ClientListPlugin', 10_000)
    reply.status(204).send()
  })
}

export default ClientListPlugin
