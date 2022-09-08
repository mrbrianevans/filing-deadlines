import {Job, Worker} from "bullmq";
import {bullConnection, loadFilingHistoryQueue} from '../../backend-shared/jobs/queueNames.js'
import {getFilingHistoryFromApi} from '../../backend-shared/companiesHouseApi/getFilingHistoryFromApi.js'
import { getRedisClient } from "../../backend-shared/getRedisClient.js";
import { workerLogger } from "../../backend-shared/loggers.js";

// load the filing history for a company into redis under company:{companyNumber}:filingHistory as a hash of id=>item
async function loadFilingHistory(job: Job<{companyNumber: string, limit?: number}>){
  const logger = workerLogger.child({workerType:'bullmq', queueName: job.queueName,jobName: job.name, jobId: job.id, jobData: job.data})
  logger.info('Processing job in ' + job.queueName)
  const {companyNumber, limit} = job.data

  const filingHistory = await getFilingHistoryFromApi(companyNumber, limit)

  if(filingHistory && filingHistory.filing_history_status === 'filing-history-available') {
    const redis = getRedisClient()
    let existed = 0 // count of filing items that were already in database
    for(const filingHistoryItem of filingHistory.items){
      const exists = await redis.hexists(`company:${companyNumber}:filingHistory`, filingHistoryItem.transaction_id)
      if(exists) existed++
      await redis.hset(`company:${companyNumber}:filingHistory`, filingHistoryItem.transaction_id, JSON.stringify(filingHistoryItem))
    }
    const total = filingHistory.items.length
    logger.info({existed, total, percentage: Math.round(existed/total*100)},'Proportion of filing items that already existed')
    await redis.quit()
  }else{
    logger.warn({isNull: filingHistory === null, filing_status: filingHistory?.filing_history_status }, 'Filing history not found for client')
  }
}


export const startLoadFilingHistoryQueueWorker = () => new Worker(loadFilingHistoryQueue, loadFilingHistory, {connection:bullConnection})
