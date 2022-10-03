import type {FilingHistoryItemResource} from "./getFilingHistoryFromApi.js";
import filingDescriptions from './filingDescriptions.json' assert {type:'json'}
import formatString from 'string-template'

export function formatFilingDescription(transaction: FilingHistoryItemResource){
  //todo: format dates properly and add currency to end for statement-of-capital
  return formatString(filingDescriptions[transaction.description], transaction.description_values)
}
