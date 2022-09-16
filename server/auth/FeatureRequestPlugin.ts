import type {FastifyPluginAsync, FastifySchema} from "fastify";
import type {FeatureRequest} from '../../fs-shared/FeatureRequest.js'
import {randomUUID} from "crypto";

const newFeatureRequestSchema: FastifySchema = {
   body: {
     type: 'object',
     properties: {
       featureTitle: {
         type: 'string'
       },
       featureDescription: {
         type: 'string'
       }
     }
   }
}

const FeatureRequestPlugin: FastifyPluginAsync = async (fastify, opts) => {

  fastify.post<{Body: FeatureRequest}>('/', {schema: newFeatureRequestSchema},async (request, reply)=>{
    const feature = request.body
    const {featureTitle} = feature
    request.log.info({featureTitle}, 'New feature requested')
    const featureId = randomUUID()
    await fastify.redis.hset(`featureRequest:${featureId}`, feature)
    await fastify.redis.hset(`featureRequest:${featureId}`, 'userId', request.session.userId)
    await fastify.redis.hset(`featureRequest:${featureId}`, 'requestedAt', new Date().toISOString())
    return {featureId}
  })

}

export default FeatureRequestPlugin
