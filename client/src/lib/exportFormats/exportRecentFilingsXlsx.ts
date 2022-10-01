
import type {RecentFilings, RecentFilingsItem} from "../../../../fs-shared/RecentFilings.js";
import {sentenceCase} from "sentence-case";


export async function exportRecentFilingsXlsx(recentFilings: RecentFilings){
  const {utils, writeFileXLSX} = await import('xlsx/xlsx.mjs')
  const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)

  const workbook = utils.book_new();
  for(const group in recentFilings) {
    const rows = recentFilings[group].map((f) => ({
      'Company number': f.companyNumber,
      'Name': f.companyName,
      'Filing date': {v: Temporal.PlainDate.from(f.filingDate).since({day:30, month: 12, year: 1899}).total('days'), t: 'n', z: 'dd/mm/yyyy'},
      'Description': f.description.replaceAll(/\*\*/g, '')
    }))
    const groupSheet = utils.json_to_sheet(rows)
    groupSheet["!cols"] = [ { wch: 15 }, { wch: 20 }, { wch: 13 }, { wch: 50 } ];
    const sheetname = group === 'persons-with-significant-control' ? 'PSC': sentenceCase(group.slice(0,31))
    utils.book_append_sheet(workbook, groupSheet, sheetname);
  }

  writeFileXLSX(workbook, 'recent filings.xlsx', {})
}
