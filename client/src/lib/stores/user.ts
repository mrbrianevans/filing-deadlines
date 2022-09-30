import {writable} from "svelte/store";
import type {User} from '../../../../fs-shared/User.js'
import {clear, swr} from '@svelte-drama/swr'
import { refreshInterval, refreshOnFocus, refreshOnReconnect } from '@svelte-drama/swr/plugin'
import type {SWROptions} from "@svelte-drama/swr/types.js";
import {readableSwrOptions} from "../swr.js";
import {navigate} from "svelte-navigator";

function createUserStore(){
  const key = '/api/user'
  const { data: {subscribe}, refresh, update, processing } = swr<User|null>(key, readableSwrOptions)

  async function logout(){
    await fetch('/api/user/logout')
    await update(()=>null)
    await clear() // when a user logs out, clear all cache entries (because they could contain user data)
    await refresh() // have to manually refresh after updating?
    navigate('/') // redirect the user to the home page after logging out
  }

  return {subscribe,logout, processing, refresh}
}

export const user = createUserStore()
