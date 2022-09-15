import {Queue, QueueEvents} from "bullmq";
import {
  bullConnection, loadFilingHistoryForClientListQueue,
  loadFilingHistoryForCompanyQueue,
  reloadClientListQueue,
  reloadCompanyProfilesQueue
} from "./queueNames.js";
import {sharedLogger} from "../loggers.js";


async function dispatchJob(queueName: string, jobData: any, comment = 'dispatched-job', delay?: number){
  sharedLogger.info({queueName, jobData, comment,delay},'Dispatching job')
  const queue = new Queue(queueName, {connection: bullConnection})
  const job = await queue.add(comment, jobData, {delay})
  sharedLogger.info({queueName, jobData, comment, jobId: job.id,},'Dispatched job successfully')
  await queue.close()
  return job
}

export async function dispatchJobSync(queueName: string, jobData: any, comment = 'dispatched-job', timeout?: number){
  sharedLogger.info({queueName, jobData, comment,timeout},'Dispatching job and waiting until finished')
  const queueEvents = new QueueEvents(reloadClientListQueue, {connection: bullConnection});
  const queue = new Queue(queueName, {connection: bullConnection})
  const job = await queue.add(comment, jobData, {})
  sharedLogger.info({queueName, jobData, comment, jobId: job.id,},'Dispatched job successfully')
  const returnValue = await job.waitUntilFinished(queueEvents, timeout)
  const state = await job.getState()
  sharedLogger.info({queueName, jobData, comment, jobId: job.id,jobState:state},'Job finished')
  await queue.close()
  await queueEvents.close()
  return returnValue
}

export async function dispatchLoadFilingHistoryForCompany(companyNumber: string, limit?: number, comment = 'dispatched-filing-job-for-company-number'){
  return await dispatchJob(loadFilingHistoryForCompanyQueue, {companyNumber, limit}, comment)
}

export async function dispatchLoadFilingHistoryForClientList(orgId: string, comment = 'dispatched-filing-job-for-client-list'){
  return await dispatchJob(loadFilingHistoryForClientListQueue, {orgId}, comment)
}

export async function dispatchReloadClientListDetails(orgId: string, comment = 'dispatched-reload-client-list'){
  return await dispatchJob(reloadClientListQueue, {orgId}, comment)
}

export async function dispatchReloadClientListDetailsSync(orgId: string, comment = 'dispatched-reload-client-list-sync', timeout=5_000){
  // can waitUntilFinished on job because it is usually very fast.
  return await dispatchJobSync(reloadClientListQueue, {orgId}, comment, timeout)
}


export async function dispatchReloadCompanyProfiles(orgId: string, comment = 'dispatched-reload-company-profiles'){
  return await dispatchJob(reloadCompanyProfilesQueue, {}, comment)
}
