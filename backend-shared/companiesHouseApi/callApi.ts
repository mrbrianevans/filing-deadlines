import {getEnv} from "../utils.js";
import {sharedLogger} from "../loggers.js";

export async function callApi<ResponseType = any>(path: string) {
  const apiUrl = 'https://api.company-information.service.gov.uk'
  const headers = {
    Authorization:
      'Basic ' + Buffer.from(getEnv('CH_API_KEY') + ':').toString('base64')
  }
  const startTime = performance.now()
  const res = await fetch(apiUrl + path, {headers})
  const duration = performance.now() - startTime
  const {ok,status} = res
  const rateLimit = getRateLimit(res.headers)
  sharedLogger.info({path, duration, ok, status, rateLimit },'Called Companies House API')
  if(rateLimit.remain < 100) sharedLogger.warn({...rateLimit},"Companies House API rate limit getting dangerously low")
  if (ok) return await res.json() as ResponseType
    // if it is null, potentially need to warn the user about missing data
  else return null
}


function getRateLimit(headers: {get(key: string): string|null}){
  return {
    limit: parseInt(headers.get('X-Ratelimit-Limit')??'0'),
    remain: parseInt(headers.get('X-Ratelimit-Remain')??'0'),
    reset: parseInt(headers.get('X-Ratelimit-Reset')??'0'),
    window: headers.get('X-Ratelimit-Window')??'0m'
  }
}
