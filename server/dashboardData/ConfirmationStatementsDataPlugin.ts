import type {FastifyPluginAsync} from "fastify";
import type {CompanyProfile} from '../../fs-shared/CompanyProfile.js'
import {
  convertCompanyProfilesToConfirmationStatementData
} from '../../fs-shared/ConfirmationStatements.js'
import {getCompanyProfileFromApi} from '../../backend-shared/companiesHouseApi/getCompanyProfile.js'

const ConfirmationStatementsDataPlugin: FastifyPluginAsync = async (fastify, opts) => {

  async function getCompanyProfile(companyNumber: string){
    const saved = await fastify.redis.get(`company:${companyNumber}:profile`)
    if(saved) return <CompanyProfile>JSON.parse(saved)
    else {
      fastify.log.info({companyNumber},'Fetching company profile from API because not found in Redis when confirmation statements dashboard data requested')
      const profile = await getCompanyProfileFromApi(companyNumber)
      if(profile) await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
      return profile
    }
  }

  // get the confirmation statement dashboard data for the current user
  fastify.get('/dashboard', async (request, reply)=>{
    const clientIds = (await fastify.redis.hkeys(`org:${request.session.orgId}:clients`)) ?? []
    request.log.info({numberOfClients: clientIds.length}, 'Getting company profiles for client list')
    const companyProfiles = await Promise.all(clientIds.map(clientId=>getCompanyProfile(clientId)))
    return convertCompanyProfilesToConfirmationStatementData(companyProfiles)
  })

}

export default ConfirmationStatementsDataPlugin

