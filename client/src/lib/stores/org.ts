/*
Stores relating to organisation and access.

 - org name (across whole app) [done]
 - whether the current user is the owner or not (across whole app) [done]
 - member list (only on manage access page) [done]
 - pending invitation (create special page) [done]

 */


import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../swr.js";
import type {OrgMemberStatus} from '../../../../fs-shared/OrgMemberStatus.js'


function createOrgStore(){
  const key = '/api/user/org/member'
  const { data: {subscribe}, error, refresh, update, processing } = swr<{owner:boolean,name:string}|null>(key, readableSwrOptions)

  return {subscribe, processing, refresh}
}

export const org = createOrgStore()

function createOrgMembersStore(){
  const key = '/api/user/org/member/members'
  const { data: {subscribe}, error, refresh, update, processing } = swr<Record<string, OrgMemberStatus>|null>(key, readableSwrOptions)

  return {subscribe, processing, refresh}
}

export const orgMembers = createOrgMembersStore()
