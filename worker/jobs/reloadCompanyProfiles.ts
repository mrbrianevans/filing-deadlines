/*

Reload all company profiles in Redis from the Companies House API.

In case there has been an issue with the streaming API and its gotten out of sync.

 */
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {getCompanyProfileFromApi} from '../../backend-shared/companiesHouseApi/getCompanyProfile.js'
import {workerLogger} from '../../backend-shared/loggers.js'
import {bullConnection, reloadCompanyProfilesQueue} from '../../backend-shared/jobs/queueNames.js'
import { Job, Worker } from 'bullmq'
import {isDeepStrictEqual} from "util";


// loop through company:number's, call API, set key in Redis. Could also check if value matched for quality control.
async function reloadCompanyProfiles(job: Job){
  const logger = workerLogger.child({workerType:'bullmq', queueName: job.queueName,jobName: job.name, jobId: job.id})
  logger.info('Processing job in ' + job.queueName)
  const redis = getRedisClient()

  const companies = redis.scanStream({match: 'company:*'})
  for await(const companyNumbers of companies){
    for(const companyNumber of companyNumbers){
      const apiProfile = await getCompanyProfileFromApi(companyNumber)
      const storedProfile = await redis.get('company:'+companyNumber+':profile')
      const equal = isDeepStrictEqual(apiProfile, storedProfile)
      if(!equal) logger.warn({companyNumber,storedProfile,apiProfile},'Stored profile not equal to profile from API')
      await redis.set('company:'+companyNumber+':profile', JSON.stringify(apiProfile))
    }
  }
  await redis.quit()
  logger.info('Finished job')
}


export const startReloadCompanyProfilesWorker = () => new Worker(reloadCompanyProfilesQueue, reloadCompanyProfiles, {connection:bullConnection})
