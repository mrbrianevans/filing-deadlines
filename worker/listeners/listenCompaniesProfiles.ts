import {streamEventsContinuously} from "./listenStream.js";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {workerLogger} from '../../backend-shared/loggers.js'

const companyListenerLogger = workerLogger.child({workerType: 'listener', stream: 'companies'})

// listen on stream, updating redis when company:companyNumber:profile exists
export async function listenCompaniesProfiles(signal?: AbortSignal){
  const redis = await getRedisClient()
  const eventStream = streamEventsContinuously('companies', signal)
  const forceStop = ()=>setTimeout(()=>{console.log('Force stop companies by throwing error');throw new Error('Companies stream didn\'t end in time')}, 1500)
  signal?.addEventListener('abort', forceStop) // wait a max of 500ms before returning
  for await(const event of eventStream){
    const companyNumber = event.data.company_number
    const key = `company:${companyNumber}:profile`
    const orgs = await redis.smembers(`company:${companyNumber}:clientLists`)
    if(orgs.length > 0) {
      const previousCompany = await redis.get(key)
      companyListenerLogger.info({key, companyNumber, event: JSON.stringify(event), inClientLists:orgs, previousCompany}, 'Company event for company in database')
      await redis.set(key, JSON.stringify(event.data))
      for (const orgId of orgs) {
        await redis.xadd(`org:${orgId}:notifications`, '*', 'companyNumber', companyNumber, 'stream', 'companies', 'event', JSON.stringify(event))
      }
    }
    if(signal?.aborted) {
      signal?.removeEventListener('abort', forceStop) // break from the loop naturally instead of force-stopping
      companyListenerLogger.info('Exiting due to abort signal')
      break
    }
  }
  await redis.quit()
}
