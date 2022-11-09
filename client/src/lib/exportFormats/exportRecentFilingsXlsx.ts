
import type {RecentFilings, RecentFilingsItem} from "../../../../fs-shared/RecentFilings.js";
import {sentenceCase} from "change-case";

/**
 * Export recent filings to an Excel spreadsheet, which is auto-downloaded for the user.
 * @param recentFilings - the recent filings data to export
 * @param splitByGroup - whether to make a new sheet for each group in recent filings, or to combine them in one sheet.
 */
export async function exportRecentFilingsXlsx(recentFilings: RecentFilings, splitByGroup = false){
  const {utils, writeFileXLSX} = await import('xlsx/xlsx.mjs')
  const Temporal = await import('@js-temporal/polyfill').then(m=>m.Temporal)

  const formatFilingItemRow = (f: RecentFilingsItem) => ({
    'Company number': f.companyNumber,
    'Name': f.companyName,
    'Filing type': sentenceCase(f.filingType),
    'Filing date': {
      v: Temporal.PlainDate.from(f.filingDate).since({day: 30, month: 12, year: 1899}).total('days'),
      t: 'n',
      z: 'dd/mm/yyyy'
    },
    'Description': f.description.replaceAll(/\*\*/g, '')
  })

  const workbook = utils.book_new();
  if(splitByGroup) {
    const groups =  [...new Set(recentFilings.map(f=>f.filingType))]
    for (const group of groups) {
      const rows = recentFilings.filter(f=>f.filingType===group).map(formatFilingItemRow).map(({'Filing type':ignoreFilingType,...f})=>f)
      const groupSheet = utils.json_to_sheet(rows)
      groupSheet["!cols"] = [{wch: 15}, {wch: 50}, {wch: 13}, {wch: 80}];
      const sheetname = group === 'persons-with-significant-control' ? 'PSC' : sentenceCase(group.slice(0, 31))
      utils.book_append_sheet(workbook, groupSheet, sheetname);
    }
  }else{
    const rows = recentFilings.map(formatFilingItemRow)
    const worksheet = utils.json_to_sheet(rows)
    worksheet["!cols"] = [{wch: 15}, {wch: 50}, {wch: 20}, {wch: 13}, {wch: 80}];
    utils.book_append_sheet(workbook, worksheet, 'Recent filings');
  }

  writeFileXLSX(workbook, 'Recent filings.xlsx', {})
}

