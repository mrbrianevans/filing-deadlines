import type {User} from '../../../../fs-shared/User.js'
import {clear, swr} from '@svelte-drama/swr'
import {navigate} from "svelte-navigator";
import {FetchError} from "../swr.js";

const fetcher = (key) => fetch(key).then(async (r) => {
  if(r.ok)  return r.json()
  else if(r.status === 401) return null // returns null for unauthorised instead of throwing error
  else throw new FetchError(await r.json())
})

function createUserStore(){
  const key = '/api/user'
  const { data: {subscribe}, refresh, update, processing } = swr<User|null>(key, {fetcher})

  async function logout(){
    await fetch('/api/user/logout')
    // console.log('fetched logout endpoint')
    await update(()=>null)
    // console.log('set user to null')
    clear() // when a user logs out, clear all cache entries (because they could contain user data)
    // console.log('cleared all swr cache entries')
    await refresh() // have to manually refresh after updating?
    // console.log('refreshed user store')
    navigate('/') // redirect the user to the home page after logging out
    // console.log('navigated home')
  }

  return {subscribe,logout, processing, refresh}
}

export const user = createUserStore()
