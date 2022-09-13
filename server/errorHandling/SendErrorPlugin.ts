import type {FastifyPluginAsync} from "fastify";


const SendErrorPlugin: FastifyPluginAsync = async (fastify, opts) => {
  await fastify.decorateReply('sendError', function(error: {message: string, error: string, statusCode: number}){
    return this.status(error.statusCode).send(error)
  })
}
