import pino from "pino";
import type PinoLoki from 'pino-loki'
import {getEnv} from "./utils.js";

export const pinoLokiOptions = (component: string, batching = true):Parameters<typeof PinoLoki>[0] => ({
  host: getEnv('LOKI_URL'),
  interval: batching ? 2 : undefined, // send batch of logs every X seconds
  labels: {component},
  replaceTimestamp: false,
  silenceErrors: false,
  timeout: 5000,
  batching
})
const getTransport = (component: string, batching = true) => pino.transport({targets:[
  {target: 'pino-loki', options: pinoLokiOptions(component, batching),level: 'trace'}
// could optionally log out errors in stdout
  ]})

export const serverLogTransport = getTransport('server', true) // batch server logs
export const serverLogger = pino(serverLogTransport)
export const workerLogger = pino(getTransport('worker', false)) // do not batch worker logs

export const sharedLogger = pino(getTransport('shared'))
