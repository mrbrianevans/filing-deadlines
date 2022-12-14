export interface OfficeAddress extends Record<string, string|undefined>{
  addressLine1?: string
  postCode: string
}


export interface RegisteredAddressResult{
  company_name: string;
  company_number: string;
  company_status: string;
  company_type: string;
  company_subtype: string;
  kind: string;
  links: {
    company_profile: string;
  };
  date_of_cessation: Date;
  date_of_creation: Date;
  registered_office_address: {
    address_line_1: string;
    address_line_2: string;
    locality: string;
    postal_code: string;
    premises: string;
    region: string;
    country: string;
  };
  sic_codes: String[];
}
export type RegisteredAddressResults = RegisteredAddressResult[]


export interface RegisteredOfficeAddressStats{
  // number of companies registered at this office address
totalRegistered: number,
  // total number of clients for this organisations client list
  numberOfClients:number,
  // number of clients who have the same postcode as this orgs office address
  clientsRegisteredAtOfficeAddress:number
}
