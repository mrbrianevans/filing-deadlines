import type {SWROptions} from "@svelte-drama/swr/types.js";
// import {refreshInterval, refreshOnFocus, refreshOnReconnect} from "@svelte-drama/swr/plugin";

//todo: add better error handling. If there is a network error, then say so. If the server returns an error, throw an Error with the message returned.
// This will allow it to be displayed to the user.

export const fetcher = (key) => fetch(key).then((r) => r.ok ? r.json():null)
export const updater = (key, data) => fetch(key, {method: 'PUT', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}}).then((r) => r.ok ? r.json():null)
export const poster = (key, data) => fetch(key, {method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'}}).then((r) => r.ok)

/** Standard options for an endpoint that can only GET. Other operations must be performed separately to the store, and then call refresh */
export const readableSwrOptions: SWROptions<any> = {
  fetcher,
  maxAge: 86400*1000, //1 day
  // plugins have been disabled because they lead to lazy development. API calls should only be made when necessary.
  // plugins: [refreshInterval({ interval: 60*1000 }), refreshOnFocus(), refreshOnReconnect()]
}

/** Standard options for an endpoint that can GET and POST */
export const writableSwrOptions: SWROptions<any> = {
  ...readableSwrOptions,
  updater
}
