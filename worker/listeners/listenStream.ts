import {get, RequestOptions } from "node:https"
import split2 from "split2"
import { IncomingMessage } from "node:http"
import {EventEmitter, on} from "node:events";
import { nextTick,stdout,env } from "node:process";
import {setTimeout} from "node:timers/promises";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {getEnv} from '../../backend-shared/utils.js'
import { workerLogger } from "../../backend-shared/loggers.js";
import { Readable } from "node:stream";
import {ReadableStream} from 'node:stream/web'

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
  const logger = workerLogger.child({workerType:'listener', stream: streamPath, startFromTimepoint})
  const auth = getEnv('CH_STREAM_KEY') + ":"
  const path = "/" + streamPath + (typeof startFromTimepoint === "number" ? `?timepoint=${startFromTimepoint}` : "")
  const options: RequestOptions = { hostname: "stream.companieshouse.gov.uk", path, auth }
  const response: IncomingMessage = await new Promise(resolve => get(options, im=>resolve(im)).end())
  const emitter = new EventEmitter({})
  response.on("close", () => emitter.emit('end'))
  logger.info({statusCode: response.statusCode, message: response.statusMessage, headers: response.headers},'Response received on stream %d %s', response.statusCode, response.statusMessage)
  if (response.statusCode === 200) {
    const destroyResponse = ()=>response.destroy()
    signal?.addEventListener('abort', destroyResponse)
    emitter.on('end', ()=>signal?.removeEventListener('abort', destroyResponse))
    emitter.on('error', ()=>signal?.removeEventListener('abort', destroyResponse))
    nextTick(() => emitter.emit('start'))
    response.pipe(split2(/\r?\n+/,l => l.trim().length>0?JSON.parse(l):undefined))
      .on("data", event => emitter.emit('event', event))
      .on("error", (e) => emitter.emit('error', e))
      .on("end", () => emitter.emit('end'))
    // setTimeout(()=>response.destroy(),20_000) // for testing being disconnected
    return emitter
  }
  else {
    response.statusCode ??= 0
    if(response.statusCode >= 400 && response.statusCode < 500) logger.info("Bad request, don't try again.")
    if(response.statusCode >= 500) logger.info("Good request, bad response. Try again in a minute.")
    response.pipe(stdout)
    throw new Error('Could not listen on stream')
  }
}
class StreamError extends Error{
  retry: boolean
  constructor(message: string, retry: boolean) {
    super(message);
    this.retry = retry
    this.name = 'StreamError'
  }
}
// listen on stream using Fetch API
export async function fetchStream(streamPath: StreamPath = "companies", startFromTimepoint?: number, signal?: AbortSignal): Promise<EventEmitter> {
  const logger = workerLogger.child({workerType:'listener', stream: streamPath, startFromTimepoint,method:'fetch'})
  const path = "/" + streamPath + (typeof startFromTimepoint === "number" ? `?timepoint=${startFromTimepoint}` : "")
  const url = new URL(path, "https://stream.companieshouse.gov.uk")
  const headers = new Headers()
  headers.set('Authorization', 'Basic '+Buffer.from(getEnv('CH_STREAM_KEY')+':').toString('base64'))
  const response = await fetch(url, {headers, signal})
  logger.info({statusCode: response.status, message: response.statusText, headers: Object.fromEntries([...response.headers])},'Response received on fetched stream %d %s', response.status, response.statusText)
  const emitter = new EventEmitter({})
  if(response.ok) {
    if (response.body) {
      try {
        const responseBody = Readable.fromWeb(<ReadableStream>response.body)
        responseBody.on("close", () => emitter.emit('end'))
        responseBody.on("error", (e) => emitter.emit('error', new StreamError(e.message, true)))
        nextTick(() => emitter.emit('start'))

        function mapper(line: string) {
          emitter.emit('heartbeat') // emit an event on every input, including blank lines (heartbeats)
          return line.trim().length > 0 ? JSON.parse(line) : undefined
        }

        responseBody.pipe(split2(/\r?\n+/, mapper))
          .on("data", event => emitter.emit('event', event))
          .on("error", (e) => emitter.emit('error', new StreamError(e.message, true)))
          .on("end", () => emitter.emit('end'))
      }catch (e) {// this can be called if the connection is aborted by the server as it's classed as a network error
        emitter.emit('error', new StreamError(e.message, true))
      }
    } else {
      nextTick(() => emitter.emit('error', new StreamError('No response body returned', true)))
    }
  }else if(response.status >= 400 && response.status < 500){
    const responseBody = await response.json()
    logger.error({responseBody}, 'Bad request to stream. Error: '+responseBody.error)
    nextTick(() => emitter.emit('error', new StreamError('Bad request', false)))
  }else if(response.status >= 500){
    const responseBody = await response.text()
    logger.error({responseBody}, 'Bad response from stream. See responseBody')
    nextTick(() => emitter.emit('error', new StreamError('Bad response', true)))
  }
  return emitter
}


export async function *streamEventsContinuously<EventType extends {event:{timepoint:number}}= any>(path: StreamPath, signal1?: AbortSignal) {
  const logger = workerLogger.child({workerType:'listener', stream: path})
  const streamTimepointKey = 'streams:timepoint:'+path
  const streamHeartbeatKey = 'streams:heartbeat:'+path
  try {
    while (true) {//  reconnect if(when) ended
      const redis = await getRedisClient()
      const ac = new AbortController()
      const abort = ()=>ac.abort()
      signal1?.addEventListener('abort', abort)
      const {signal} = ac

      //pick up at left off timepoint (saved in redis)
      const previousTimepoint = await redis.get(streamTimepointKey)
      const previousHeartbeat = await redis.get(streamHeartbeatKey)
      if (previousTimepoint||previousHeartbeat) logger.info({previousTimepoint,previousHeartbeat},"Picking up from previous time point")
      const eventEmitter = await fetchStream(path, previousTimepoint ? parseInt(previousTimepoint) : undefined, signal1)
      eventEmitter.on('end', () => {
        logger.info("Event emitter ended")
        ac.abort()
      })
      eventEmitter.on('start', () => logger.info("Event emitter started"))
      eventEmitter.on('error', (e) => logger.error(e, "Event emitter errored. Retry="+e.retry))
      eventEmitter.on('heartbeat', async () => !signal.aborted && await redis.set(streamHeartbeatKey, new Date().toISOString()))
      let counter = 0, lastTimepoint: number | null = null, retry = true
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
        logger.debug(e, 'Error in on:event loop')
        if(e.retry === false) retry = false
      }
      await redis.quit()
      signal1?.removeEventListener('abort', abort)
      logger.info({counter, lastTimepoint}, 'End of looping through events')
      if(signal1?.aborted || !retry) break
      logger.info('Will restart in 60 seconds from last timepoint')
      await setTimeout(60_000) // wait a minute before reconnecting
    }
  } catch (e) {
    // this shouldn't ever be called! It indicates that the worker is NOT listening to events, and won't restart automatically.
    logger.error(e,"Exiting update script due to failure to connect to Streaming API.")
  }
  logger.info("Exited stream loop. Needs to be manually restarted.")
}
