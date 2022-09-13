import pino from "pino";
import type PinoLoki from 'pino-loki'
import {getEnv} from "./utils.js";

export const pinoLokiOptions: (component: string) => Parameters<typeof PinoLoki>[0] = component => ({
  host: getEnv('LOKI_URL'),
  interval: 2, // send batch of logs every X seconds
  labels: {component},
  replaceTimestamp: false,
  silenceErrors: false,
  timeout: 5000,
  batching: true
})
const getTransport = (component: string) => pino.transport({target: 'pino-loki', options: pinoLokiOptions(component)})

export const serverLogger = pino(getTransport('server'))
export const workerLogger = pino(getTransport('worker'))

export const sharedLogger = pino(getTransport('shared'))
