/*

Reload all company details in a client list.

 */
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {workerLogger} from '../../backend-shared/loggers.js'
import {
  bullConnection,
  reloadClientListQueue
} from '../../backend-shared/jobs/queueNames.js'
import type {ClientListItem} from '../../fs-shared/ClientList.js'
import { Job, Worker } from 'bullmq'

// loop through the clients in an organisations client list and update the details from the company profile. This is for if a company name or status has changed.
async function reloadClientList(job: Job<{orgId:string}>){
  const logger = workerLogger.child({workerType:'bullmq', queueName: job.queueName,jobName: job.name, jobId: job.id, jobData: job.data})
  logger.info('Processing job in ' + job.queueName)
  const startTime = performance.now()
  if(!job.data?.orgId) {
    logger.error('reloadClientList called without orgId')
    return false
  }
  const {orgId} = job.data
  const redis = getRedisClient()
// could also be done with hScanStream(`org:${orgId}:clients`) to get an AsyncIterator
  const companies = await redis.hkeys(`org:${orgId}:clients`)
  for (const companyNumber of companies){
    const profile = await redis.get(`company:${companyNumber}:profile`).then(JSON.parse)
    const client: ClientListItem = {company_number: companyNumber, added_on: new Date().toISOString(),company_name: profile?.company_name, company_status: profile?.company_status}
    await redis.hset(`org:${orgId}:clients`, companyNumber, JSON.stringify(client))
  }
  await redis.quit()
  logger.info({durationMs: performance.now() - startTime, length: companies.length}, 'Finished job')
}


export const startReloadClientListWorker = () => new Worker(reloadClientListQueue, reloadClientList, {connection:bullConnection})
