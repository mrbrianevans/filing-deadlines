
// the idea here is to write logs to loki about new jobs, finished jobs, errored jobs, delayed jobs etc. Because the worker itself might not be able to.

import {QueueEvents} from "bullmq";
import { bullConnection } from "../../backend-shared/jobs/queueNames.js";
import { workerLogger } from "../../backend-shared/loggers.js";

// log the various events that take place on a queue. Returns the QueueEvents instance which needs to be closed when done.
export function logEvents(queueName){
  const logger = workerLogger.child({workerType:'bullmq', queueName})
  const startTimes = new Map() // to time how long it takes jobs from being dispatched to completing.
  const queueEvents = new QueueEvents(queueName, {connection: bullConnection})
  queueEvents.on('added', function(args, id){
    startTimes.set(args.jobId, performance.now())
    logger.info({jobName: args.name, jobId: args.jobId, jobData: args.data, jobOpts: args.opts}, 'Job added to queue')
  })
  queueEvents.on('active', function(args, id){
    logger.debug({jobId: args.jobId, prevState: args.prev}, 'Job active')
  })
  queueEvents.on('completed', function(args, id){
    const duration = performance.now() - startTimes.get(args.jobId)
    startTimes.delete(args.jobId)
    logger.info({jobId: args.jobId, prevState: args.prev, returnValue: args.returnvalue,duration}, 'Job completed')
  })
  queueEvents.on('delayed', function(args, id){
    logger.debug({jobId: args.jobId}, 'Job delayed')
  })
  queueEvents.on('error', function(error){
    logger.error(error, 'Error in job')
  })
  queueEvents.on('failed', function(args, id){
    logger.error({jobId: args.jobId, prevState: args.prev, failedReason: args.failedReason}, 'Job failed')
  })
  queueEvents.on('paused', function(args, id){
    logger.info({id}, 'Queue paused')
  })
  queueEvents.on('resumed', function(args, id){
    logger.info({id}, 'Queue resumed')
  })
  queueEvents.on('removed', function(args, id){
    logger.info({jobId: args.jobId, prevState: args.prev}, 'Job removed')
  })
  queueEvents.on('progress', function(args, id){
    logger.debug({jobId: args.jobId, data: args.data}, 'Job progress reported')
  })
  queueEvents.on('stalled', function(args, id){
    logger.warn({jobId: args.jobId}, 'Job stalled')
  })
  queueEvents.on('waiting', function(args, id){
    logger.debug({jobId: args.jobId}, 'Job waiting')
  })
  queueEvents.on('retries-exhausted', function(args, id){
    logger.warn({jobId: args.jobId, attemptsMade: args.attemptsMade}, 'Job retries exhausted')
  })
  return queueEvents
}
