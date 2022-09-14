import {streamEventsContinuously} from "./listenStream.js";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {workerLogger} from '../../backend-shared/loggers.js'

const filingListenerLogger = workerLogger.child({workerType: 'listener', stream: 'filings'})
// listen on stream, updating redis when company:companyNumber:filingHistory exists
export async function listenFilings(signal?: AbortSignal){
  const redis = await getRedisClient()
  for await(const event of streamEventsContinuously('filings')){
    const companyNumber = event.data.company_number
      // loop through company:{companyNumber}:clientLists of orgIds, and for each one: ZADD org:${orgId}:clientFilings {daysSinceEpoch} {companyNumber:transactionId}
    const orgs = await redis.smembers(`company:${companyNumber}:clientLists`)
    if(orgs.length > 0) {
      const f = event.data
      for (const orgId of orgs) {
        await redis.zadd(`org:${orgId}:clientFilings`, new Date(f.date).getTime() / 86_400_000, `${companyNumber}:${f.transaction_id}`)
      }
      const key = `company:${companyNumber}:filingHistory`
      const filingExists = await redis.hexists(key, event.resource_id)
      filingListenerLogger.info({
        filingExists,
        filingId: event.resource_id,
        companyNumber
      }, 'Filing event for company in database')
      await redis.hset(key, event.resource_id, JSON.stringify(event.data))
    }
    if(signal?.aborted) {
      filingListenerLogger.info('Exiting due to abort signal')
      break
    }
  }
  await redis.quit()
}
