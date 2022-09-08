import {Queue} from "bullmq";
import {bullConnection, loadFilingHistoryQueue} from "./queueNames.js";
import {sharedLogger} from "../loggers.js";


async function dispatchJob(queueName: string, jobData: any, comment = 'dispatched-job'){
  sharedLogger.info({queueName, jobData, comment},'Dispatching job')
  const queue = new Queue(queueName, {connection: bullConnection})
  const job = await queue.add(comment, jobData)
  sharedLogger.info({queueName, jobData, comment, jobId: job.id,},'Dispatched job successfully')
  await queue.close()

}

export async function dispatchLoadFilingHistory(companyNumber: string, limit?: number, comment = 'dispatched-filing-job'){
  await dispatchJob(loadFilingHistoryQueue, {companyNumber, limit}, comment)
}
