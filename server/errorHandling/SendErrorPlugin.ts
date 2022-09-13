import type {FastifyPluginAsync} from "fastify";


const SendErrorPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorateReply('sendError', function (error: { message: string; error: string; statusCode: number; }) {
    return this.status(error.statusCode).send(error);
  })
}
export default SendErrorPlugin
