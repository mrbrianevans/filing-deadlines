import {get, RequestOptions } from "node:https"
import split2 from "split2"
import { IncomingMessage } from "node:http"
import {EventEmitter, on} from "node:events";
import { nextTick,stdout,env } from "node:process";
import {setTimeout} from "node:timers/promises";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {getEnv} from '../../backend-shared/utils.js'
import { workerLogger } from "../../backend-shared/loggers.js";

export type StreamPath =
  | "insolvency-cases"
  | "companies"
  | "filings"
  | "charges"
  | "persons-with-significant-control"
  | "officers"
  | "disqualified-officers"
  | string


/**
 * Connect to a stream, parse the events JSON.
 * @param streamPath - the url path to the stream. Eg 'filings' or 'companies' etc.
 * @param startFromTimepoint - (optional) a timepoint to begin from. If omitted then streams starts at latest event.
 * @param signal - Abort signal for request
 * @returns an event emitter, which emits the following events:
 *
 *  - `event` - an object when an event is received on the stream.
 *  - `end` - when the stream ends (disconnected).
 *  - `start` - when the stream has connected.
 *  - `error` - if there is an error parsing the output from the stream.
 *  @throws if unable to connect to stream (eg due to authentication).
 */
export async function listenToStream(streamPath: StreamPath = "companies", startFromTimepoint?: number, signal?: AbortSignal): Promise<EventEmitter> {
  const auth = getEnv('CH_STREAM_KEY') + ":"
  const path = "/" + streamPath + (typeof startFromTimepoint === "number" ? `?timepoint=${startFromTimepoint}` : "")
  const options: RequestOptions = { hostname: "stream.companieshouse.gov.uk", path, auth }
  const response: IncomingMessage = await new Promise(resolve => get(options, im=>resolve(im)).end())
  response.on("close", () => emitter.emit('end'))
  const emitter = new EventEmitter({})
  if (response.statusCode === 200) {
    signal?.addEventListener('abort', ()=>response.destroy())
    nextTick(() => emitter.emit('start'))
    response.pipe(split2(/\r?\n+/,l => l.trim().length>0?JSON.parse(l):undefined,{signal}))
      .on("data", event => emitter.emit('event', event))
      .on("error", (e) => emitter.emit('error', e))
      .on("end", () => emitter.emit('end'))
    // setTimeout(()=>response.destroy(),20_000) // for testing being disconnected
    return emitter
  }
  else {
    response.pipe(stdout)
    throw new Error('Could not listen on stream')
  }
}

export async function *streamEventsContinuously<EventType extends {event:{timepoint:number}}= any>(path: StreamPath, signal1?: AbortSignal) {
  const logger = workerLogger.child({workerType:'listener', stream: path})
  const streamTimepointKey = 'streams:timepoint:'+path
  try {
    while (true) {//  reconnect if(when) ended
      const redis = await getRedisClient()
      const ac = new AbortController()
      const abort = ()=>ac.abort()
      signal1?.addEventListener('abort', abort)
      const {signal} = ac

      //pick up at left off timepoint (saved in redis)
      const previousTimepoint = await redis.get(streamTimepointKey)
      if (previousTimepoint) logger.info({previousTimepoint},"Picking up from previous time point")
      const eventEmitter = await listenToStream(path, previousTimepoint ? parseInt(previousTimepoint) : undefined, signal1)
      eventEmitter.on('end', () => {
        logger.info("Event emitter ended")
        ac.abort()
      })
      eventEmitter.on('start', () => logger.info("Event emitter started"))
      eventEmitter.on('error', (e) => logger.error(e, "Event emitter errored"))
      let counter = 0, lastTimepoint: number | null = null
      try {
        for await(const events of on(eventEmitter, 'event', {signal})) {
          for (const event of <EventType[]>events) {
            counter++
            await redis.set(streamTimepointKey, event.event.timepoint)
            lastTimepoint = event.event.timepoint
            yield event
          }
        }
      } catch (e) {
        if (e.code !== 'ABORT_ERR') throw e
      }
      logger.info({counter, lastTimepoint}, 'End of looping through events. Will restart in 60 seconds from last timepoint')
      await redis.quit()
      signal1?.removeEventListener('abort', abort)
      if(signal1?.aborted) break
      await setTimeout(60_000) // wait a minute before reconnecting
    }
  } catch (e) {
    logger.error(e,"Exiting update script due to failure to connect to Streaming API.")
  }
}
