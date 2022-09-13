import {CompanyProfile} from "./CompanyProfile.js";
import {DashboardData} from "./DashboardData.js";

export interface ConfirmationStatementItem{
  company_number: string,
  company_name: string,
  company_status: string,
  company_type: string,
  confirmation_statement?: {
    last_made_up_to?: string,
    next_made_up_to: string,
    next_due: string,
    overdue: boolean
  }
}

export type ConfirmationStatementsData = ConfirmationStatementItem[]


export function convertCompanyProfilesToConfirmationStatementData(companyProfiles: (CompanyProfile|null)[]): ConfirmationStatementsData{
  return companyProfiles.filter(c=>c!==null).map((c:CompanyProfile)=>({
    company_number: c.company_number,
    company_name: c.company_name,
    company_status: c.company_status,
    company_type: c.type,
    confirmation_statement: c.confirmation_statement
  })).sort(sortConfirmationStatementData)
}


export function sortConfirmationStatementData(a: ConfirmationStatementItem, b: ConfirmationStatementItem){
  return new Date(a.confirmation_statement?.next_due??0).getTime() - new Date(b.confirmation_statement?.next_due??0).getTime()
}
