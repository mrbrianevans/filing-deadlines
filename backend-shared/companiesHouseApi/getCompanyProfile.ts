import type {CompanyProfile} from '../../fs-shared/CompanyProfile.js'
import {callApi} from "./callApi.js";


export async function getCompanyProfileFromApi(companyNumber: string): Promise<CompanyProfile|null>{
  const profile = await callApi<CompanyProfile>(`/company/${companyNumber}`)
  return profile
}
