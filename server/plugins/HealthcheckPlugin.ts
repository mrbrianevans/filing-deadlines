import type {FastifyPluginAsync} from "fastify";
import {getEnv} from "../../backend-shared/utils.js";

const HealthcheckPlugin: FastifyPluginAsync = async (fastify, opts) => {

  /** performance time how long it takes to set a single key in Redis */
  async function timeRedisOp(){
    const startTime = performance.now()
    await fastify.redis.set('healthcheck', new Date().toISOString())
    return performance.now() - startTime
  }

  fastify.get('/', async (request, reply)=>{
    const lokiReady = await fetch(new URL('ready',getEnv('LOKI_URL'))).then(r=> r.ok).catch(()=>false)
    const redisOpMs = await timeRedisOp().catch(()=>false)
    const health = {
      timestamp: new Date().toISOString(),
      redisStatus: fastify.redis.status, redisOpMs,
      lokiReady
    }
    // set status code to OK only if all services are okay, otherwise 500.
    if(health.lokiReady && health.redisStatus === 'ready') reply.status(200)
    else reply.status(500)
    return health
  })

}

export default HealthcheckPlugin
