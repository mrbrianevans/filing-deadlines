import {writable} from "svelte/store";
import type {User} from '../../../fs-shared/User.js'
import { swr } from '@svelte-drama/swr'
import { refreshInterval, refreshOnFocus, refreshOnReconnect } from '@svelte-drama/swr/plugin'
import type {SWROptions} from "@svelte-drama/swr/types.js";

function createUserStore(){
  const key = '/api/user'
  const options: SWROptions<User> = {
    fetcher: (key) => fetch(key).then((r) => r.ok ? r.json():null),
    maxAge: 86400*1000, //1 day
    plugins: [refreshInterval({ interval: 60*1000 }), refreshOnFocus(), refreshOnReconnect()],
  }
  const { data: {subscribe}, error, refresh, update } = swr<User|null>(key, options)

  async function logout(){
    await fetch('/api/user/logout')
    await update(()=>null)
    await refresh() // have to manually refresh after updating?
  }

  return {subscribe,logout}
}

export const user = createUserStore()
