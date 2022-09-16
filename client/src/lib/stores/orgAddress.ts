/*
Stores relating to organisation and access.

 - org name (across whole app) [done]
 - whether the current user is the owner or not (across whole app) [done]
 - member list (only on manage access page) [done]
 - pending invitation (create special page) [done]

 */


import {swr} from "@svelte-drama/swr";
import {readableSwrOptions, updater, writableSwrOptions} from "../swr.js";
import type {CompanyProfile} from "../../../../fs-shared/CompanyProfile.js";


function createOrgAddressStore(){
  const key = '/api/user/org/member/registered-address/address'
  const { data: {subscribe,update}, error, refresh, processing, } = swr<{postCode: string, addressLine1?: string}|null>(key, writableSwrOptions)

  // async function set(newAddress){
  //   await updater(key, newAddress)
  // }

  return {subscribe, processing, error, refresh, update}
}

export const orgAddress = createOrgAddressStore()

function createCompaniesAtAddressStore(){
  // throws an error if the address is not set for this organisation
  const key = '/api/user/org/member/registered-address/list'
  const { data: {subscribe}, error, refresh, update, processing } = swr<CompanyProfile[]>(key, readableSwrOptions)

  return {subscribe, processing, error, refresh}
}

export const companiesAtAddress = createCompaniesAtAddressStore()
