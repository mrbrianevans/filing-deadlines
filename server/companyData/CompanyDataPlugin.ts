import type {FastifyPluginAsync, FastifySchema} from "fastify";
import type {CompanyProfile} from '../../fs-shared/CompanyProfile.js'
import {getCompanyProfileFromApi} from '../../backend-shared/companiesHouseApi/getCompanyProfile.js'

const getCompanyProfileSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      companyNumber: {
        type: 'string',
        "minLength": 8,
        "maxLength": 8
      }
    }
  }
}

const CompanyDataPlugin: FastifyPluginAsync = async (fastify, opts) => {

  async function getCompanyProfile(companyNumber: string){
    if(!companyNumber) throw new Error("Empty company number")
    const saved = await fastify.redis.get(`company:${companyNumber}:profile`)
    if(saved) return <CompanyProfile>JSON.parse(saved)
    else {
      fastify.log.info({companyNumber},'Fetching company profile from API because not found in Redis when company profile requested')
      const profile = await getCompanyProfileFromApi(companyNumber)
      if(profile) await fastify.redis.set(`company:${companyNumber}:profile`, JSON.stringify(profile))
      return profile
    }
  }

  // get company profile by company number
  fastify.get<{Params: {companyNumber: string}}>('/:companyNumber', {schema: getCompanyProfileSchema},async (request, reply)=>{
    const {companyNumber} = request.params
    request.log.info({companyNumber}, 'Getting company profile for company number')
    const companyProfile = await getCompanyProfile(companyNumber)
    return companyProfile
  })

}

export default CompanyDataPlugin
