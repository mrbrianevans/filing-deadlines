import {getEnv} from "../utils.js";
import {sharedLogger} from "../loggers.js";
import {setTimeout} from "timers/promises";

// won't let the rate limit get lower than this value
const neverGoBelow = 1

// cache rate limit up here and check it before calling the API
let rateLimit:RateLimit = { remain: 600, limit: 600, reset: Date.now(), window: '5m' }

async function waitForRateLimit(){
  if(rateLimit.limit <= neverGoBelow){
    const duration = rateLimit.reset * 1000 - Date.now()
    sharedLogger.info({rateLimit,duration},'Sleeping %i ms to avoid hitting Companies House rate limit', duration)
    await setTimeout(duration)
  }
}

export async function callApi<ResponseType = any>(path: string) {
  const apiUrl = 'https://api.company-information.service.gov.uk'
  const headers = {
    Authorization:
      'Basic ' + Buffer.from(getEnv('CH_API_KEY') + ':').toString('base64')
  }
  await waitForRateLimit() // wait for rate limit BEFORE calling API
  const startTime = performance.now()
  const res = await fetch(apiUrl + path, {headers})
  const duration = performance.now() - startTime
  const {ok,status} = res
  rateLimit = getRateLimit(res.headers)
  sharedLogger.info({path, duration, ok, status, rateLimit },'Called Companies House API')
  if(rateLimit.remain < 10) sharedLogger.warn({...rateLimit},"Companies House API rate limit getting dangerously low")
  if(rateLimit.remain === 0){
    sharedLogger.error("Exhausted Companies House Rate limit. Sleeping 60 seconds.")
    await setTimeout(60_000)
  }
  if (ok) return await res.json() as ResponseType
    // if it is null, potentially need to warn the user about missing data
  else return null
}


interface RateLimit {
  remain: number;
  limit: number;
  reset: number;
  window: string;
}

function getRateLimit(headers: {get(key: string): string|null}): RateLimit {
  return {
    limit: parseInt(headers.get('X-Ratelimit-Limit')??'0'),
    remain: parseInt(headers.get('X-Ratelimit-Remain')??'0'),
    reset: parseInt(headers.get('X-Ratelimit-Reset')??'0'),
    window: headers.get('X-Ratelimit-Window')??'0m'
  }
}
