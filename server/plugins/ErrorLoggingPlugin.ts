import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {CustomFastifyErrorSchema} from "../types/CustomFastifyError.js";

const errorLoggingSchema: FastifySchema = {
  body: CustomFastifyErrorSchema
}

const ErrorLoggingPlugin: FastifyPluginAsync = async (fastify, opts) => {

  fastify.post('/', {schema: errorLoggingSchema}, async (request, reply) => {
    const error = request.body
    const {userId, orgId, owner} = request.session
    request.log.error({error,session: {userId, orgId, owner}}, 'Client side error')
    return reply.status(204).send()
  })

  fastify.post('/report',{schema: errorLoggingSchema},async (request, reply) => {
    const error = request.body
    const {userId, orgId, owner} = request.session
    request.log.error({error,session: {userId, orgId, owner}}, 'Client side error reported by user')
    return reply.status(204).send()
  })
}

export default ErrorLoggingPlugin
