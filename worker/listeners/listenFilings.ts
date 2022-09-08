import {streamEventsContinuously} from "./listenStream.js";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {workerLogger} from '../../backend-shared/loggers.js'

const filingListenerLogger = workerLogger.child({workerType: 'listener', stream: 'filings'})
// listen on stream, updating redis when company:companyNumber:filingHistory exists
export async function listenFilings(signal?: AbortSignal){
  if(signal) signal.addEventListener('abort', ()=>filingListenerLogger.info("Abort requested"))
  const redis = await getRedisClient()
  for await(const event of streamEventsContinuously('filings')){
    const companyNumber = event.data.company_number
    const key = `company:${companyNumber}:filingHistory`
    const exists = await redis.exists(key)
    if(!exists) continue
    const filingExists = await redis.hexists(key, event.resource_id)
    filingListenerLogger.info({filingExists,filingId: event.resource_id, companyNumber},'Filing event for company in database')
    await redis.hset(key, event.resource_id, JSON.stringify(event.data))
    if(signal?.aborted) {
      filingListenerLogger.info('Exiting due to abort signal')
      break
    }
  }
  await redis.quit()
}
