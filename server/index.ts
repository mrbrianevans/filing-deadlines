
import Fastify from 'fastify'
import { getEnv } from '../backend-shared/utils.js'
const port = parseInt(process.env.PORT??'4004')

const fastify = Fastify({logger: {level: 'trace'}})

//register any third party plugins here
{
  // @ts-ignore
  fastify.register(import('@fastify/cookie'))
  // @ts-ignore
  fastify.register(import('@fastify/session'), {
    secret: getEnv('SESSION_SECRET'),
    cookie: {
      secure: false // for testing on http://localhost
    }
  })
  const redisUrl = new URL(getEnv('REDIS_URL'))
  fastify.register(import('@fastify/redis'), {host: redisUrl.hostname, port: parseInt(redisUrl.port, 10) || undefined })
}


fastify.register(async (fastify, opts)=>{
  // register endpoints here
  fastify.register(import('./auth/SignInWithXeroPlugin.js'), {prefix: 'sign-in/xero'})
  fastify.register(import('./auth/UserPlugin.js'), {prefix: 'user'})
}, {prefix: 'api'})

await fastify.listen({port, host: '::'})


// graceful shutdown
process.on('SIGINT', shutdown) // quit on ctrl-c when running docker in terminal
process.on('SIGTERM', shutdown)// quit properly on docker stop
async function shutdown(sig: string){
  console.info('Graceful shutdown commenced', new Date().toISOString(), sig);
  await fastify.close()
  process.exit()
}
