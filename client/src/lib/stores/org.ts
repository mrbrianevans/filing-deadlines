/*
Stores relating to organisation and access.

 - org name (across whole app) [done]
 - whether the current user is the owner or not (across whole app) [done]
 - member list (only on manage access page) [done]
 - pending invitation (create special page) [done]

 */


import {writable} from "svelte/store";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../swr.js";
import type {OrgMemberStatus} from '../../../../fs-shared/OrgMemberStatus.js'
import type {SubscriptionPlans} from '../../../../fs-shared/SubscriptionPlans.js'
import type {User} from '../../../../fs-shared/User.js'

export interface OrgSubscription {
  subscriptionPlan: SubscriptionPlans | null
  activeUntil: string
  status: string
  signedUpOnStripe: boolean
}

/** The owner subscription endpoint rejects everyone except a logged-in org owner who already has a plan. */
export function userCanLoadOrgSubscription(account: User | null | undefined): account is User {
  return Boolean(account && account.orgPlan && account.owner)
}


function createOrgMembersStore(){
  const key = '/api/user/org/member/members'
  const { data: {subscribe}, error, refresh, update, processing } = swr<Record<string, OrgMemberStatus>|null>(key, readableSwrOptions)

  return {subscribe, processing, refresh}
}

export const orgMembers = createOrgMembersStore()

function createOrgSubscriptionStore(){
  const key = '/api/user/org/member/owner/subscription'
  // Keep SWR's data store private. Subscribing to it fetches immediately (the cache starts stale),
  // and its refresh() forces a second request that is not deduped with the in-flight one.
  const {refresh: reload, processing} = swr<OrgSubscription>(key, readableSwrOptions)
  const data = writable<OrgSubscription | undefined>(undefined)
  let requestSerial = 0

  return {
    subscribe: data.subscribe,
    processing,
    reset() {
      requestSerial++
      data.set(undefined)
    },
    refresh(): Promise<void> {
      const serial = ++requestSerial
      // Runtime returns the fetcher result; the library types it as void.
      return Promise.resolve(reload()).then((value) => {
        if (serial === requestSerial) data.set(value as unknown as OrgSubscription | undefined)
      })
    }
  }
}

export const orgSubscription = createOrgSubscriptionStore()
