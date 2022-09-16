import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {advancedCompanySearch} from '../../backend-shared/companiesHouseApi/advancedCompanySearch.js'
import type {OfficeAddress} from '../../fs-shared/OfficeAddress.js'
import {CustomFastifyErrorSchema} from "../types/CustomFastifyError.js";
import type {RegisteredAddressResult} from "../../fs-shared/OfficeAddress.js";

const addressSchema = {
  type: 'object',
  properties: {
    postCode: {type:'string'},
    addressLine1: {type:'string'}
  },
  required: ['postCode']
}
const getAddressSchema: FastifySchema = {
  response: {
    '200': {anyOf: [addressSchema, { "type": "null" }]},
    '400': CustomFastifyErrorSchema,
    '500': CustomFastifyErrorSchema
  }
}
const updateAddressSchema: FastifySchema = {
  body: addressSchema
}

const transformAddressResult = (item: Exclude<Awaited<ReturnType<typeof advancedCompanySearch>>, null>['items'][number]):RegisteredAddressResult => ({
  company_name: item.company_name,
  company_number: item.company_number,
  company_status: item.company_status,
  company_type: item.company_type,
  company_subtype: item.company_subtype,
  kind: item.kind,
  links: {
    company_profile: item.links.company_profile
  },
  date_of_cessation: item.date_of_cessation,
  date_of_creation: item.date_of_creation,
  registered_office_address: {
    address_line_1: item.registered_office_address.address_line_1,
    address_line_2: item.registered_office_address.address_line_2,
    locality: item.registered_office_address.locality,
    postal_code: item.registered_office_address.postal_code,
    premises: item.registered_office_address.premises,
    region: item.registered_office_address.region,
    country: item.registered_office_address.country,
  },
  sic_codes: item.sic_codes,
})

const RegisteredAddressPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // fetch orgs office address
  fastify.get('/address', {schema: getAddressSchema}, async (request, reply)=> {
    const exists = await fastify.redis.exists(`org:${request.session.orgId}:address`)
    if(exists)
      return await fastify.redis.hgetall(`org:${request.session.orgId}:address`)
    else return null
  })

  // update orgs office address
  fastify.put<{Body: {postCode:string, addressLine1?: string}}>('/address', {schema: updateAddressSchema}, async (request, reply)=> {
    const address = request.body
    await fastify.redis.hset(`org:${request.session.orgId}:address`, address)
    return await fastify.redis.hgetall(`org:${request.session.orgId}:address`)
  })

  // list companies at this address
  fastify.get('/list' , async (request, reply)=>{
    const exists = await fastify.redis.exists(`org:${request.session.orgId}:address`)
    if(!exists) return reply.sendError({statusCode: 400, error: 'Address not set', message: 'You need to set your organisations office address before you can view the list of companies who are registered there.'})
    const address = <OfficeAddress>await fastify.redis.hgetall(`org:${request.session.orgId}:address`)
    const result = await advancedCompanySearch({location: `${address.addressLine1??''} ${address.postCode}`, size: 1000})
    if(result === null){
      request.log.error('Failed to perform advanced company search, or received zero results')
      return []
    }
    if(result.hits > result.items.length) request.log.warn({matches: result.hits, returnedResults: result.items.length},'More results matched address than what was returned')
    return result.items.map(transformAddressResult)
  })
}

export default RegisteredAddressPlugin
