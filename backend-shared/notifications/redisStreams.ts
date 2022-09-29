import {getRedisClient} from "../getRedisClient.js";


interface ListenRedisStreamOptions{
  signal?: AbortSignal
}

export async function *listenRedisStream<EventType extends Record<string, string>>(streamKeys: string[], {signal}: ListenRedisStreamOptions = {}){
  const redis = getRedisClient()
  while (!signal?.aborted){
    // blocks for 1 second, if nothing comes then try again. This is to keep checking the abort signal.
    const event = await redis.xread('BLOCK', 1000, 'STREAMS',...streamKeys, '$')
    if(event){
      const [stream, items] = event[0]
      const [eventId, rawData] = items[0]
      // convert ['key', 'value', 'key2', 'value2'] into {key: 'value', key2: 'value2'}
      const parsedData = rawData.reduce((prev, curr, idx)=>{idx % 2 !== 0 ? prev[(idx-1)/2].push(curr):prev.push([curr]); return prev}, <string[][]>[])
      const data: EventType = Object.fromEntries(parsedData)
      yield {stream, eventId, data}
    }
  }
  await redis.quit()
}
