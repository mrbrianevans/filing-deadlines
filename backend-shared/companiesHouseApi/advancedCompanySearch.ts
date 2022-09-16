import {callApi} from "./callApi.js";
import {sharedLogger} from "../loggers.js";
import {CompaniesResource} from "@companieshouse/api-sdk-node/dist/services/search/advanced-search/index.js";


interface SearchCriteria{
  company_name_includes?: string
  company_name_excludes?: string
  company_status?: string|string[]
  company_subtype?: string|string[]
  company_type?: string|string[]
  dissolved_from?: Date
  dissolved_to?: Date
  incorporated_from?: Date
  incorporated_to?: Date
  location?: string
  sic_codes?: string|string[]
  size?: number
  start_index?: number
}

export async function advancedCompanySearch(filters: SearchCriteria){
  const path = `/advanced-search/companies`
  const searchQuery = new URLSearchParams()
  filters.size ??= 20
  for (const filtersKey in filters) {
    const values = filters[filtersKey]
    if(values instanceof Array) values.forEach(v=>searchQuery.set(filtersKey, v))
    else if (values instanceof Date) searchQuery.set(filtersKey, values.toISOString().split('T')[0])
    else searchQuery.set(filtersKey, values)
  }
  const results = await callApi<CompaniesResource>(path + '?' + searchQuery.toString())
  // if(results === null) {
  // this is fired if there are zero results, the API returns a 404 error
  //   sharedLogger.error('Advanced company search failed')
  //   throw new Error('Advanced company search failed')
  // }
  sharedLogger.info({numberOfResults: results?.items.length},'Performed advanced search on Companies House API')
  return results
}
