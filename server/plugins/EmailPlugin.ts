/*
Handles incoming email
 */


import type {FastifyPluginAsync} from "fastify";

const EmailPlugin: FastifyPluginAsync = async (fastify, opts) => {

  await fastify.register(import('@fastify/multipart'), { attachFieldsToBody: 'keyValues', limits: {fields: 20, files: 5, fileSize: 1024 * 1024 * 10} })

  fastify.post('/handleIncoming', async (request, reply)=>{
    request.log.info({body: request.body}, 'Received incoming email')
    await fastify.redis.sadd(`incomingEmails`, JSON.stringify(request.body))
    reply.status(200).send()
  })
}

export default EmailPlugin
