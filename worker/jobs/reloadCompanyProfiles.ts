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
import assert from "node:assert";


// loop through company:number's, call API, set key in Redis. Could also check if value matched for quality control.
async function reloadCompanyProfiles(job: Job){
  const logger = workerLogger.child({workerType:'bullmq', queueName: job.queueName,jobName: job.name, jobId: job.id})
  logger.info('Processing job in ' + job.queueName)
  const redis = getRedisClient()

  const companies = redis.scanStream({match: 'company:*:profile'})
  for await(const companyProfileKeys of companies){
    for(const companyKey of companyProfileKeys){
      const [,companyNumber] = companyKey.match(/^company:(.{8}):profile$/)
      assert(companyNumber.length === 8, 'Company number is not 8 characters long: '+companyNumber)
      const apiProfile = await getCompanyProfileFromApi(companyNumber)
      const storedProfileString = await redis.get('company:'+companyNumber+':profile')
      if(!storedProfileString) {
        logger.error({companyNumber}, 'Cant find company profile for company number from redis key scan. Exiting loop.')
        break
      }
      const storedProfile = JSON.parse(storedProfileString)
      const equal = isDeepStrictEqual(apiProfile, storedProfile)
      if(!equal) logger.warn({companyNumber,storedProfile:storedProfileString,apiProfile:JSON.stringify(apiProfile)},'Stored profile not equal to profile from API')
      await redis.set('company:'+companyNumber+':profile', JSON.stringify(apiProfile))
    }
  }
  await redis.quit()
  logger.info('Finished job')
}


export const startReloadCompanyProfilesWorker = () => new Worker(reloadCompanyProfilesQueue, reloadCompanyProfiles, {connection:bullConnection})
