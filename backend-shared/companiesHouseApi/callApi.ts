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
  sharedLogger.info({path, duration, ok, status },'Called Companies House API')
  if (ok) return await res.json() as ResponseType
    // if it is null, potentially need to warn the user about missing data
  else return null
}
