/*
Handles incoming email, parsed by SendGrid.
*/


import type {FastifyPluginAsync} from "fastify";

const EmailPlugin: FastifyPluginAsync = async (fastify, opts) => {

  await fastify.register(import('@fastify/multipart'), { attachFieldsToBody: 'keyValues', limits: {fields: 20, files: 5, fileSize: 1024 * 1024 * 10} })

  fastify.post<{Body: SendGridParseBody}>('/handleIncoming', async (request, reply)=>{
    request.log.debug({body: request.body}, 'Received incoming email')
    const contents = request.body.text
    const {to, from, sender_ip, subject} = request.body
    request.log.info({to, from, sender_ip, subject, contents}, 'Received incoming email from %s', from)
    await fastify.redis.sadd(`incomingEmails`, JSON.stringify(request.body))
    return reply.status(200).send()
  })
}

export default EmailPlugin


interface SendGridParseBody {
  text: string,
  html: string,
  to: string,
  from: string,
  // stringified JSON object
  envelope: string,
  subject: string,
  sender_ip: string,
  // stringified JSON object
  charsets: string,
  dkim: string,
  headers: string,
  SPF: string
}
