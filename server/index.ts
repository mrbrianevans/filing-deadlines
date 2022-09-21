
import Fastify from 'fastify'
import { getEnv } from '../backend-shared/utils.js'
import { getRedisClient } from '../backend-shared/getRedisClient.js'
import {serverLogTransport} from '../backend-shared/loggers.js'
import connectRedis from 'connect-redis'
import fastifySession from '@fastify/session'
const port = parseInt(process.env.PORT??'4004')

const fastify = Fastify({logger: {stream: serverLogTransport, level: 'trace'}})

const RedisStore = connectRedis(fastifySession as any)
//register any third party plugins here
{
  await fastify.register(import('@fastify/cookie'))
  await fastify.register(import('@fastify/session'), {
    secret: getEnv('SESSION_SECRET'),
    cookie: {
      secure: getEnv('SITE_ADDRESS').startsWith('https'),
      maxAge: 86400_000*30
    },
    saveUninitialized: false,
    // set store to Redis so that sessions are persisted after server restarts
    store: new RedisStore({
      client: getRedisClient()
    }) as any
  })
  const redisUrl = new URL(getEnv('REDIS_URL'))
  await fastify.register(import('@fastify/redis'), {host: redisUrl.hostname, port: parseInt(redisUrl.port, 10) || undefined, closeClient:true })
}

fastify.decorateReply('sendError', function (error: { message: string; error: string; statusCode: number; }) {
  return this.status(error.statusCode).send(error);
})

await fastify.register(async (fastify, opts)=>{
  // register endpoints here
  await fastify.register(import('./auth/SignInWithXeroPlugin.js'), {prefix: 'sign-in/xero'})
  await fastify.register(import('./auth/UserPlugin.js'), {prefix: 'user'})
  await fastify.register(import('./plugins/ErrorLoggingPlugin.js'), {prefix: 'error'})
}, {prefix: 'api'})

await fastify.listen({port, host: '::'})


// graceful shutdown
process.on('SIGINT', shutdown) // quit on ctrl-c when running docker in terminal
process.on('SIGTERM', shutdown)// quit properly on docker stop
async function shutdown(sig: string){
  console.info('Graceful shutdown commenced', new Date().toISOString(), sig);
  // fastify.log.flush()
  await fastify.close()
  process.exit()
}

if(process.env.CI) setTimeout(shutdown, 2500, 'timeout') // shutdown after 2.5 seconds if running on a CI server
