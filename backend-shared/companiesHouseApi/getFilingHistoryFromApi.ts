import {callApi} from "./callApi.js";
import {CompanyFilingHistoryResource} from "@companieshouse/api-sdk-node/dist/services/company-filing-history/index.js";


export async function getFilingHistoryFromApi(companyNumber: string, limit = 35){
  return await callApi<CompanyFilingHistoryResource>(`/company/${companyNumber}/filing-history?items_per_page=${limit}`)
}
