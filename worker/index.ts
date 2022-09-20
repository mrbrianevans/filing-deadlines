import {startReloadCompanyProfilesWorker} from "./jobs/reloadCompanyProfiles.js";
import {listenCompaniesProfiles} from "./listeners/listenCompaniesProfiles.js";
import {listenFilings} from "./listeners/listenFilings.js";
import {Queue, QueueScheduler} from "bullmq";
import {
  bullConnection,
  loadFilingHistoryForClientListQueue, loadFilingHistoryForCompanyQueue, reloadClientListQueue,
  reloadCompanyProfilesQueue
} from "../backend-shared/jobs/queueNames.js";
import { workerLogger } from "../backend-shared/loggers.js";
import {startLoadFilingHistoryForCompanyQueueWorker} from "./jobs/loadFilingHistoryForCompany.js";
import {startReloadClientListWorker} from "./jobs/reloadClientList.js";
import {setTimeout} from 'node:timers/promises'
import {setTimeout as setTimeoutCallback} from 'node:timers'
import {startLoadFilingHistoryClientListQueueWorker} from "./jobs/loadFilingHistoryForClientList.js";
import {logEvents} from "./jobs/jobLogger.js";
import {clearTimeout} from "timers";

const queueNames = [loadFilingHistoryForClientListQueue,loadFilingHistoryForCompanyQueue,reloadClientListQueue,reloadCompanyProfilesQueue]
const toClose: {close(): Promise<void>}[] = []
// register schedulers
for (const queueName of queueNames) {
  toClose.push(new QueueScheduler(queueName, {connection:bullConnection})) // queue scheduler
  toClose.push(logEvents(queueName)) // log events
}

// add repeated jobs (cron jobs)
const profileQueue = new Queue(reloadCompanyProfilesQueue, {connection:bullConnection})
await profileQueue.add('daily-reload', {}, {repeat: {tz: 'Europe/London', pattern: '0 1 * * *'}})

// start workers
toClose.push(
  startReloadCompanyProfilesWorker(),
  startLoadFilingHistoryForCompanyQueueWorker(),
  startReloadClientListWorker(),
  startLoadFilingHistoryClientListQueueWorker()
)

// streams
const ac = new AbortController()
const {signal} = ac
const companiesStream = listenCompaniesProfiles(signal)
const filingsStream = listenFilings(signal)

// close all streams and redis connections on shutdown
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
async function shutdown(sig){
  const received = Date.now()
  workerLogger.info({signal: sig,received},"Graceful shutdown requested")
  const timeout = setTimeoutCallback(()=>process.exit(1), 10_000) // just in case
  ac.abort() // should end streams
  await Promise.allSettled(toClose.map(bullInstance => bullInstance.close()))
  workerLogger.info({signal: sig,received},"Graceful shutdown bullmq instances closed")
  await Promise.allSettled([companiesStream, filingsStream])
  workerLogger.info({signal: sig,received},"Graceful shutdown streams ended")
  workerLogger.info({signal: sig,received},"Graceful shutdown completed, exiting")
  console.log(new Date(), {signal: sig,received},"Graceful shutdown completed, exiting")
  workerLogger.flush()
  await setTimeout(750) // wait for final logs to be flushed
  clearTimeout(timeout)
  process.exit()
}

if(process.env.CI) setTimeoutCallback(shutdown, 2500, 'timeout') // shutdown after 2.5 seconds if running on a CI server
