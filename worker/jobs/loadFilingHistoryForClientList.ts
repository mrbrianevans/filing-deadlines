import {Job, Worker} from "bullmq";
import {
  bullConnection,
  loadFilingHistoryForClientListQueue
} from '../../backend-shared/jobs/queueNames.js'
import { getRedisClient } from "../../backend-shared/getRedisClient.js";
import { workerLogger } from "../../backend-shared/loggers.js";

// load the Sorted Set of filing history for all the companies in a client list of an organisation.
async function loadFilingHistoryForClientList(job: Job<{orgId: string}>){
  const logger = workerLogger.child({workerType:'bullmq', queueName: job.queueName,jobName: job.name, jobId: job.id, jobData: job.data})
  logger.info('Processing job in ' + job.queueName)
  const startTime = performance.now()
  const {orgId} = job.data

  const redis = getRedisClient()

  const companyNumbers = await redis.hkeys(`org:${orgId}:clients`)
  await Promise.all(companyNumbers.map(companyNumber=>redis.sadd(`company:${companyNumber}:clientLists`, orgId)))
  for(const companyNumber of companyNumbers){
    const filings = await redis.hvals(`company:${companyNumber}:filingHistory`)
    await Promise.all(filings.map(f=>JSON.parse(f??'{}')).map(f=>redis.zadd(`org:${orgId}:clientFilings`,new Date(f.date).getTime()/86_400_000, `${companyNumber}:${f.transaction_id}`)))
  }


  await redis.quit()
  logger.info({duration: performance.now()-startTime},'Finished job in ' + job.queueName)
}

export const startLoadFilingHistoryClientListQueueWorker = () => new Worker(loadFilingHistoryForClientListQueue, loadFilingHistoryForClientList, {connection:bullConnection})
