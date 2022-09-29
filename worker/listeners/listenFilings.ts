import {streamEventsContinuously} from "./listenStream.js";
import {getRedisClient} from '../../backend-shared/getRedisClient.js'
import {workerLogger} from '../../backend-shared/loggers.js'

const filingListenerLogger = workerLogger.child({workerType: 'listener', stream: 'filings'})
// listen on stream, updating redis when company:companyNumber:filingHistory exists
export async function listenFilings(signal?: AbortSignal){
  const redis = await getRedisClient()
  const eventStream = streamEventsContinuously('filings', signal)
  const forceStop = ()=>setTimeout(()=>{console.log('Force stop filings by throwing error');throw new Error('Filings stream didn\'t end in time')}, 1500)
  signal?.addEventListener('abort', forceStop) // wait a max of 500ms before returning
  for await(const event of eventStream){
    // insert will create a new bloom filter if it doesn't already exist and then add the transactionId to the filter, returns 1 if the event is probably new, or 0 if its definitely not new.
    const [eventIsNew] = <boolean[]>await redis.call('BF.INSERT', 'streams:filings:idsFilter', 'CAPACITY', 1_000_000,'ERROR', 0.001,'ITEMS', event.resource_id)
    if(eventIsNew) { // avoids processing duplicates and sending duplicate notifications
      const companyNumber = event.resource_uri.split('/')[2]
      // loop through company:{companyNumber}:clientLists of orgIds, and for each one: ZADD org:${orgId}:clientFilings {daysSinceEpoch} {companyNumber:transactionId}
      const orgs = await redis.smembers(`company:${companyNumber}:clientLists`)
      if (orgs.length > 0) {
        const f = event.data
        // only save a notification in STREAM if the filing is on someone's client list
        await redis.xadd(`notifications:filing`, '*', 'companyNumber', companyNumber, 'transactionId', f.transaction_id, 'event', JSON.stringify(event))
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
      } // company is on some client lists
    }// event is new
    if(signal?.aborted) {
      signal?.removeEventListener('abort', forceStop) // break from the loop naturally instead of force-stopping
      filingListenerLogger.info('Exiting due to abort signal')
      break
    } // signal aborted
  } //for each event
  await redis.quit()
}
