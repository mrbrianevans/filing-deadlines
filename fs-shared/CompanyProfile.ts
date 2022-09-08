export interface CompanyProfile {
  company_name: string;
  company_number: string;
  company_status: string;
  company_status_detail: string;
  date_of_creation: string;
  jurisdiction: string;
  sic_codes: string[];
  has_been_liquidated: boolean;
  has_super_secure_pscs?: boolean;
  type: string;
  has_charges: boolean;
  has_insolvency_history: boolean;
  registered_office_address: RegisteredOfficeAddressResource;
  accounts: AccountsResource;
  confirmation_statement?: ConfirmationStatementResource;
  links: LinksResource;
  annual_return: {last_made_up_to: string;next_due?: string;}
}

interface RegisteredOfficeAddressResource {
  address_line_1: string;
  address_line_2?: string;
  care_of?: string;
  country?: string;
  locality: string;
  po_box?: string;
  postal_code: string;
  premises?: string;
  region?: string;
}

interface AccountsResource {
  last_accounts: Lastaccounts;
  accounting_reference_date: Accountingreferencedate;
  next_accounts?: NextAccountsResource;
  next_due?: string;
  overdue?: boolean;
}

interface Accountingreferencedate {
  month: string;
  day: string;
}
interface Lastaccounts {
  made_up_to: string;
  type: string;
  period_end_on: string;
}
interface NextAccountsResource {
  period_end_on: string;
  period_start_on: string;
}

interface ConfirmationStatementResource {
  last_made_up_to?: string;
  next_due: string;
  next_made_up_to: string;
  overdue: boolean;
}

interface LinksResource {
  filing_history?: string;
  self?: string
  overseas?: string
}
