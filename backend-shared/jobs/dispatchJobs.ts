import {Queue} from "bullmq";
import {
  bullConnection,
  loadFilingHistoryQueue,
  reloadClientListQueue,
  reloadCompanyProfilesQueue
} from "./queueNames.js";
import {sharedLogger} from "../loggers.js";


async function dispatchJob(queueName: string, jobData: any, comment = 'dispatched-job', delay?: number){
  sharedLogger.info({queueName, jobData, comment},'Dispatching job')
  const queue = new Queue(queueName, {connection: bullConnection})
  const job = await queue.add(comment, jobData, {delay})
  sharedLogger.info({queueName, jobData, comment, jobId: job.id,},'Dispatched job successfully')
  await queue.close()
}

export async function dispatchLoadFilingHistory(companyNumber: string, limit?: number, comment = 'dispatched-filing-job'){
  // wait 5 minutes before loading filing history to avoid rate limiting on the API
  await dispatchJob(loadFilingHistoryQueue, {companyNumber, limit}, comment, 5*60*1000)
}

export async function dispatchReloadClientListDetails(orgId: string, comment = 'dispatched-reload-client-list'){
  await dispatchJob(reloadClientListQueue, {orgId}, comment)
}

export async function dispatchReloadCompanyProfiles(orgId: string, comment = 'dispatched-reload-company-profiles'){
  await dispatchJob(reloadCompanyProfilesQueue, {}, comment)
}
