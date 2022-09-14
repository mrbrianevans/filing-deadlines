import {startReloadCompanyProfilesWorker} from "./jobs/reloadCompanyProfiles.js";
import {listenCompaniesProfiles} from "./listeners/listenCompaniesProfiles.js";
import {listenFilings} from "./listeners/listenFilings.js";
import {Queue, QueueScheduler} from "bullmq";
import {bullConnection, reloadCompanyProfilesQueue} from "../backend-shared/jobs/queueNames.js";
import { workerLogger } from "../backend-shared/loggers.js";
import {startLoadFilingHistoryForCompanyQueueWorker} from "./jobs/loadFilingHistoryForCompany.js";
import {startReloadClientListWorker} from "./jobs/reloadClientList.js";
import {setTimeout} from 'node:timers/promises'
import {startLoadFilingHistoryClientListQueueWorker} from "./jobs/loadFilingHistoryForClientList.js";

const profileQueueScheduler = new QueueScheduler(reloadCompanyProfilesQueue, {connection:bullConnection})
const profileQueue = new Queue(reloadCompanyProfilesQueue, {connection:bullConnection})
await profileQueue.add('daily-reload', {}, {repeat: {tz: 'Europe/London', pattern: '0 1 * * *'}})
const profileWorker = startReloadCompanyProfilesWorker()
const filingHistoryWorker = startLoadFilingHistoryForCompanyQueueWorker()
const clientListWorker = startReloadClientListWorker()
const filingHistoryClientListWorker = startLoadFilingHistoryClientListQueueWorker()
const ac = new AbortController()
const {signal} = ac
const companiesStream = listenCompaniesProfiles(signal)
const filingsStream = listenFilings(signal)

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
async function shutdown(sig){
  const received = Date.now()
  workerLogger.info({signal: sig,received},"Graceful shutdown requested")
  ac.abort() // should end streams
  await Promise.allSettled([companiesStream, filingsStream])
  workerLogger.info({signal: sig,received},"Graceful shutdown streams ended")
  await profileWorker.close()
  await filingHistoryWorker.close()
  await filingHistoryClientListWorker.close()
  await clientListWorker.close()
  await profileQueueScheduler.close()
  workerLogger.info({signal: sig,received},"Graceful shutdown completed, exiting")
  console.log(new Date(), {signal: sig,received},"Graceful shutdown completed, exiting")
  workerLogger.flush()
  await setTimeout(500) // wait for final logs to be flushed
  process.exit()
}
