import type {FastifyPluginAsync, FastifySchema} from "fastify";

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
    '200': {anyOf: [addressSchema, { "type": "null" }]}
  }
}
const updateAddressSchema: FastifySchema = {
  body: addressSchema
}

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
    const address = await fastify.redis.hgetall(`org:${request.session.orgId}:address`)
    //todo: call gov api for advanced company search with location={address}, return all results
    return []
  })
}

export default RegisteredAddressPlugin
