import type {FastifyPluginAsync} from "fastify";

const ClientLoggingPlugin: FastifyPluginAsync = async (fastify, opts) => {

  fastify.post('/navigation', async (request, reply) => {
    const url = JSON.parse(<string>request.body)
    const userAgent = request.headers["user-agent"]
    const {userId, orgId, owner} = request.session
    request.log.info({url, session: {userId, orgId, owner}, component: 'client', userAgent}, 'Client side navigation to %s', url.pathname)
    return reply.status(204).send()
  })

  fastify.post('/visibility', async (request, reply) => {
    const {visibilityState} = JSON.parse(<string>request.body)
    const userAgent = request.headers["user-agent"]
    const {userId, orgId, owner} = request.session
    request.log.info({visibilityState, session: {userId, orgId, owner}, component: 'client', userAgent}, 'Client side visibility state changed to %s', visibilityState)
    return reply.status(204).send()
  })

}

export default ClientLoggingPlugin
