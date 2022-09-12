import {CompanyProfile} from "./CompanyProfile.js";

export interface DashboardDataItem{
  company_number: string
  company_name: string
  accounting_reference_date?: {month: number, day: number},
  last_accounts?: { made_up_to: string, type: string};
  next_due_accounts?: string;
  next_accounts_made_up_to?: string;
  company_status: 'active'|string
  "date_of_creation": string,
  "company_type": "ltd"|'llp'|string,
  "annual_return"?: {
    "last_made_up_to"?: string,
    "next_due"?: string
  }
}

export type DashboardData = DashboardDataItem[]


const sample: DashboardDataItem = {
  company_number: '09160294',
  company_name: 'SP TACKLE LTD',
  accounting_reference_date: { month: 8, day: 31 },
  last_accounts: { made_up_to: '2021-08-31', type: 'unaudited-abridged' },
  next_due_accounts: '2023-05-31',
  company_status: 'active',
  date_of_creation: '2014-08-04',
  company_type: 'ltd',
  annual_return: { last_made_up_to: '2015-08-04', next_due: '2016-09-01' }
}

export function convertCompanyProfilesToDashboard(companyProfiles: (CompanyProfile|null)[]): DashboardData{
  return companyProfiles.filter(c=>c!==null).map((c:CompanyProfile)=>({
    company_number: c.company_number,
    company_name: c.company_name,
    accounting_reference_date: c.accounts?.accounting_reference_date?{ month: parseInt(c.accounts?.accounting_reference_date.month), day: parseInt(c.accounts?.accounting_reference_date.day) }:undefined,
    last_accounts: c.accounts?.last_accounts,
    next_due_accounts: c.accounts?.next_due,
    next_accounts_made_up_to: c.accounts.next_accounts?.period_end_on,
    company_status: c.company_status,
    date_of_creation: c.date_of_creation,
    company_type: c.type,
    annual_return: c.annual_return
  })).sort(sortDashboardData)
}

function sortDashboardData(a: DashboardDataItem, b: DashboardDataItem){
  return new Date(a.next_due_accounts??0).getTime() - new Date(b.next_due_accounts??0).getTime()
}
