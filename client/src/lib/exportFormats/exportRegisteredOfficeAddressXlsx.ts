
import type {RegisteredAddressResults,RegisteredAddressResult} from "../../../../fs-shared/OfficeAddress.js";
import {sentenceCase} from "sentence-case";
import {company_status, company_type} from "../../assets/constants.json";

/**
 * Export registered office address data to an Excel spreadsheet, which is auto-downloaded for the user.
 */
export async function exportRegisteredOfficeAddressXlsx(data: RegisteredAddressResults){
  const {utils, writeFileXLSX} = await import('xlsx/xlsx.mjs')
  const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)

  const formatAddress = r => [[r.premises, r.address_line_1, r.address_line_2], [r.locality, r.region, r.postal_code, r.country]].map(p=>p.filter(s=>s).join(', ')).filter(s=>s).join(', ')
  const formatRow = (f: RegisteredAddressResult) => ({
    'Company number': f.company_number,
    'Company name': f.company_name,
    'Company status': company_status[f.company_status],
    'Company type': company_type[f.company_type],
    'Registered office address': formatAddress(f.registered_office_address),
    'Post code': f.registered_office_address.postal_code,
    'Premises': f.registered_office_address.premises,
    'Address line 1': f.registered_office_address.address_line_1,
    'Address line 2': f.registered_office_address.address_line_2,
    'Locality': f.registered_office_address.locality,
    'Region': f.registered_office_address.region,
    'Country': f.registered_office_address.country
  })

  const workbook = utils.book_new();
 {
    const rows = data.map(formatRow)
    const worksheet = utils.json_to_sheet(rows)
    worksheet["!cols"] = [{wch: 15}, {wch: 50}, {wch: 20}, {wch: 13}, {wch: 80}];
    utils.book_append_sheet(workbook, worksheet, 'RegisteredOfficeAddress');
  }

  writeFileXLSX(workbook, 'Registered Office Address companies.xlsx', {})
}

