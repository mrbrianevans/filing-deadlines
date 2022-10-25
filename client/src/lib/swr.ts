import type {SWROptions} from "@svelte-drama/swr/types.js";
// import {refreshInterval, refreshOnFocus, refreshOnReconnect} from "@svelte-drama/swr/plugin";

// better error handling. If there is a network error, then say so. If the server returns an error, throw an Error with the message returned.
// This will allow it to be displayed to the user. If the response code is 401, then refresh the user, because they may have been logged out.
// It handles errors from fastify well, but not sure about network errors. Requires testing.
export class FetchError extends Error{
  // status code of response
  statusCode: number
  constructor(fastifyErrorResponse: {message: string, error: string, statusCode: number} ) {
    super(fastifyErrorResponse.message);
    this.name = fastifyErrorResponse.error
    this.statusCode = fastifyErrorResponse.statusCode
  }
  toJSON(){
    return {message: this.message, error: this.name, statusCode:this.statusCode}
  }
}
export const fetcher = (key) => fetch(key).then(async (r) => {
  if(r.ok)  return r.json()
    // could handle certain response codes differently:
    // - 401 status code, refresh user store and retry the request if it returns a user
    // - 403 status code, suggest that the user upgrade their subscription plan
    // - 502 status code, the server is failing health checks, tell the user the server is down and stop sending more requests.
    // - 400 response code, probably a mistake by the user but could also be a bug
  else throw new FetchError(await r.json())
})
export const updater = (key, data) => fetch(key, {method: 'PUT', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}}).then((r) => r.ok ? r.json():null)
export const poster = (key, data) => fetch(key, {method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}}).then((r) => r.ok)

/** Standard options for an endpoint that can only GET. Other operations must be performed separately to the store, and then call refresh */
export const readableSwrOptions: SWROptions<any> = {
  fetcher,
  maxAge: 86400*1000, //1 day
  // plugins have been disabled because they lead to lazy development. API calls should only be made when necessary.
  // plugins: [refreshInterval({ interval: 60*1000 }), refreshOnFocus(), refreshOnReconnect()]
}
type WritableSWROptions = SWROptions<any> & {updater: typeof updater}
/** Standard options for an endpoint that can GET and POST */
export const writableSwrOptions: WritableSWROptions = {
  ...readableSwrOptions,
  updater
}
