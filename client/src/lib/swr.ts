import type {SWROptions} from "@svelte-drama/swr/types.js";
import {refreshInterval, refreshOnFocus, refreshOnReconnect} from "@svelte-drama/swr/plugin";

const fetcher = (key) => fetch(key).then((r) => r.ok ? r.json():null)
const updater = (key, data) => fetch(key, {method: 'PUT', body: JSON.stringify(data)}).then((r) => r.ok ? r.json():null)

/** Standard options for an endpoint that can only GET. Other operations must be performed separately to the store, and then call refresh */
export const readableSwrOptions: SWROptions<any> = {
  fetcher,
  maxAge: 86400*1000, //1 day
  plugins: [refreshInterval({ interval: 60*1000 }), refreshOnFocus(), refreshOnReconnect()]
}

/** Standard options for an endpoint that can GET and POST */
export const writableSwrOptions: SWROptions<any> = {
  ...readableSwrOptions,
  updater
}
