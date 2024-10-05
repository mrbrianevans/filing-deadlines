import type {FilingHistoryItemResource} from "./getFilingHistoryFromApi.js";
import filingDescriptions from './filingDescriptions.json' with {type:'json'}
import formatString from 'string-template'
import {sharedLogger} from "../loggers.js";

export function formatFilingDescription(transaction: FilingHistoryItemResource){
  //todo: format dates properly and add currency to end for statement-of-capital
  if(transaction.description in filingDescriptions)
  return formatString(filingDescriptions[transaction.description], transaction.description_values)
  else if(transaction.description === 'legacy') return transaction.description_values?.description ?? transaction.description
  else{
    // for legacy filing descriptions, maybe it needs to return the description value?
    sharedLogger.warn({transaction},'Filing description not found for '+transaction.description)
    return transaction.description
  }
}
