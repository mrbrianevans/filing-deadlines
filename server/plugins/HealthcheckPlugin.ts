import type {FastifyPluginAsync} from "fastify";
import {getEnv} from "../../backend-shared/utils.js";

const HealthcheckPlugin: FastifyPluginAsync = async (fastify, opts) => {

  /** performance time how long it takes to set a single key in Redis */
  async function timeRedisOp() {
    const startTime = performance.now()
    await fastify.redis.set('healthcheck', new Date().toISOString())
    return performance.now() - startTime
  }

  fastify.get('/', async (request, reply) => {
    const lokiReady = await fetch(new URL('ready', getEnv('LOKI_URL'))).then(r => r.ok).catch(() => false)
    const redisOpMs = await timeRedisOp().catch(() => false)
    // check if the worker is online and connected to the filing and company streams
    const lastFilingHeartbeat = await fastify.redis.get('streams:heartbeat:filings')
    const lastCompanyHeartbeat = await fastify.redis.get('streams:heartbeat:companies')
    const streamsActive = lastFilingHeartbeat && lastCompanyHeartbeat && dateWithinSeconds(lastCompanyHeartbeat, 60) && dateWithinSeconds(lastFilingHeartbeat, 60)
    const health = {
      timestamp: new Date().toISOString(),
      redisStatus: fastify.redis.status,
      redisOpMs,
      lokiReady,
      lastFilingHeartbeat,
      lastCompanyHeartbeat,
      streamsActive
    }
    request.log.info('Status healthcheck', {health})
    // set status code to OK only if all services are okay, otherwise 500.
    if (health.lokiReady && health.redisStatus === 'ready' && streamsActive) reply.status(200)
    else reply.status(500)
    return health
  })

}

// returns true if a given date is within {seconds} seconds of the current timestamp, future or past.
const dateWithinSeconds = (date: Date | string, seconds: number): boolean => Math.abs(Date.now() - new Date(date).getTime()) < seconds * 1000

export default HealthcheckPlugin
