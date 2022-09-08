import type {FastifyPluginAsync} from "fastify";
import type {CompanyProfile} from '../../fs-shared/CompanyProfile.js'
import {convertCompanyProfilesToDashboard} from '../../fs-shared/DashboardData.js'
import {getCompanyProfileFromApi} from '../../backend-shared/getCompanyProfile.js'

const DashboardDataPlugin: FastifyPluginAsync = async (fastify, opts) => {

  async function getCompanyProfile(companyNumber: string){
    const saved = await fastify.redis.get(`company:${companyNumber}:profile`)
    if(saved) return <CompanyProfile>JSON.parse(saved)
    else {
      fastify.log.debug({companyNumber},'Fetching company profile from API because not found in Redis when dashboard data requested')
      const profile = await getCompanyProfileFromApi(companyNumber)
      if(profile) await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
      return profile
    }
  }

  // get the dashboard data for the current user
  fastify.get('/', async (request, reply)=>{
    const clientIds = (await fastify.redis.hkeys('user:'+request.session.userId+':clients')) ?? []
    request.log.info({numberOfClients: clientIds.length},'Getting company profiles for client list')
    const companyProfiles = await Promise.all(clientIds.map(clientId=>getCompanyProfile(clientId)))
    return convertCompanyProfilesToDashboard(companyProfiles)
  })

}

export default DashboardDataPlugin


