import type {CompanyProfile} from '../../fs-shared/CompanyProfile.js'
import {callApi} from "./callApi.js";


export async function getCompanyProfileFromApi(companyNumber: string): Promise<CompanyProfile|null>{
  if(companyNumber) {
    const normalisedNumber = companyNumber?.trim().padStart(8, '0')
    const profile = await callApi<CompanyProfile>(`/company/${normalisedNumber}`)
    return profile
  }else{
    return null
  }
}
