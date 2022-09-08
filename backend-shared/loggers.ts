import pino from "pino";


export const serverLogger = pino({level: 'trace', base: {component: 'server'}})
export const workerLogger = pino({level: 'trace', base: {component: 'worker'}})

export const sharedLogger = pino({level: 'trace', base: {component: 'shared'}})
