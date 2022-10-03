import {formatFilingDescription} from "../companiesHouseApi/formatFilingDescription.js";
import type { FilingHistoryItemResource } from "../companiesHouseApi/getFilingHistoryFromApi.js";


/**
 * Creates a notification object which can be sent to a user. For consistent notification formats throughout the application.
 * @param companyNumber - company number, included in notification data
 * @param companyName - company name, used in notification title
 * @param filingEvent - filing event data to get description and filing date etc.
 */
export function formatFilingNotification(companyNumber, companyName, filingEvent: FilingHistoryItemResource){
  const description = formatFilingDescription(filingEvent)
  const webNotification = {
    title: `New ${filingEvent.category.replaceAll('-', ' ')} filing for ${companyName}`,
    options: {
      body: description.replaceAll(/\*\*/g, ''),
      data: {url: '/recent-filings?p=P1D', companyNumber, transactionId: filingEvent.transaction_id},
      tag: filingEvent.transaction_id, // prevents duplicate notifications for the same transaction
      icon: 'https://filingdeadlines.co.uk/icon/icon500.svg',
      actions: [
      // could have an action to view filing on companies house
        {action: 'View', title: 'View recent filings', icon: 'https://filingdeadlines.co.uk/icon/icon500.svg'}
      ]
    }
  }
  return webNotification
}
