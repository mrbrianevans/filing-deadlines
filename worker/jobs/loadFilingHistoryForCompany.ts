import {Job, Worker} from "bullmq";
import {bullConnection, loadFilingHistoryForCompanyQueue} from '../../backend-shared/jobs/queueNames.js'
import {getFilingHistoryFromApi} from '../../backend-shared/companiesHouseApi/getFilingHistoryFromApi.js'
import { getRedisClient } from "../../backend-shared/getRedisClient.js";
import { workerLogger } from "../../backend-shared/loggers.js";

// load the filing history for a company into redis under company:{companyNumber}:filingHistory as a hash of id=>item
async function loadFilingHistoryForCompany(job: Job<{companyNumber: string, limit?: number}>){
  const logger = workerLogger.child({workerType:'bullmq', queueName: job.queueName,jobName: job.name, jobId: job.id, jobData: job.data})
  logger.info('Processing job in ' + job.queueName)
  const {companyNumber, limit} = job.data

  const filingHistory = await getFilingHistoryFromApi(companyNumber, limit)
  if(filingHistory && filingHistory.filing_history_status === 'filing-history-available') {
    const redis = getRedisClient()
    {
      // loop through SMEMBERS  company:{companyNumber}:clientLists of orgIds, and for each one: ZADD org:${orgId}:clientFilings {daysSinceEpoch} {companyNumber:transactionId}
      const orgs = await redis.smembers(`company:${companyNumber}:clientLists`)
      for (const orgId of orgs) {
        // this could be replaced with a single call to ZADD with multiple members, but it gets messy with the scores.
        await Promise.all(filingHistory.items.map(f=>redis.zadd(`org:${orgId}:clientFilings`, new Date(f.date).getTime()/86_400_000, `${companyNumber}:${f.transaction_id}`)))
      }
    }
    let existed = 0 // count of filing items that were already in database
    for(const filingHistoryItem of filingHistory.items){
      const exists = await redis.hexists(`company:${companyNumber}:filingHistory`, filingHistoryItem.transaction_id)
      if(exists) existed++
      else {
        await redis.hset(`company:${companyNumber}:filingHistory`, filingHistoryItem.transaction_id, JSON.stringify(filingHistoryItem))
      }
    }
    const total = filingHistory.items.length
    logger.info({existed, total, percentage: Math.round(existed/total*100)},'Proportion of filing items that already existed')
    await redis.quit()
  }else{
    logger.warn({isNull: filingHistory === null, filing_status: filingHistory?.filing_history_status }, 'Filing history not found for client')
  }
}

// will process a maximum of 100 jobs per 5 minutes. This should help avoid the API rate limit.
export const startLoadFilingHistoryForCompanyQueueWorker = () => new Worker(loadFilingHistoryForCompanyQueue, loadFilingHistoryForCompany, {connection:bullConnection,limiter: {max:100,duration: 5*60*1000}})


//todo: it would be good to refactor the load filing history job:
// at the moment, a new job is created for each client that is added.
// I propose making it a single job to load the filing history for all the clients in a newly uploaded client list.
// This would make it easier to track the progress of the job, and also to better check the rate limit for the API.
