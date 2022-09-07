import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {testQueueName} from '../backend-shared/queueNames.js'
import type {HelloWorldResponse} from '../fs-shared/endpointTypes.js'

const schema = {
  response: {
    '200': {
      type: 'object', properties: {
        hello: {
          type: 'string'
        }
      }
    }
  }
}

const HelloWorldPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get<{Reply: HelloWorldResponse}>('/', {schema}, async (request, reply) => {
    return {hello: testQueueName}
  })
}

export default HelloWorldPlugin
