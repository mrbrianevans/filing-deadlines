
import {getEnv} from "../utils.js";
// only import this file if you need the redis connection.
// Simply importing it will check for the redis environment variable, even if it's not used.
const redisUrl = new URL(getEnv('REDIS_URL'))
export const bullConnection = {host: redisUrl.hostname, port: parseInt(redisUrl.port, 10) || undefined }


export const reloadCompanyProfilesQueue = 'reloadCompanyProfiles'
export const reloadClientListQueue = 'reloadClientList'
export const loadFilingHistoryForCompanyQueue = 'loadFilingHistory'
export const loadFilingHistoryForClientListQueue = 'loadFilingHistoryForClientList'

