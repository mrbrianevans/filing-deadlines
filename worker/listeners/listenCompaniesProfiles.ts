import {streamEventsContinuously} from "./listenStream.js";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {workerLogger} from '../../backend-shared/loggers.js'

const companyListenerLogger = workerLogger.child({workerType: 'listener', stream: 'companies'})

// listen on stream, updating redis when company:companyNumber:profile exists
export async function listenCompaniesProfiles(signal?: AbortSignal){
  const redis = await getRedisClient()
  for await(const event of streamEventsContinuously('companies')){
    const companyNumber = event.data.company_number
    const key = `company:${companyNumber}:profile`
    const orgs = await redis.smembers(`company:${companyNumber}:clientLists`)
    if(orgs.length > 0) {
      const previousCompany = await redis.get(key)
      companyListenerLogger.info({key, companyNumber, event: JSON.stringify(event), inClientLists:orgs, previousCompany}, 'Company event for company in database')
      await redis.set(key, JSON.stringify(event.data))
    }
    if(signal?.aborted) {
      companyListenerLogger.info('Exiting due to abort signal')
      break
    }
  }
  await redis.quit()
}
