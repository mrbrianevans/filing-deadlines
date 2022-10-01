

export interface RecentFilingsItem {
  filingDate: string,
  companyNumber: string,
  transactionId: string
  companyName: string,
  // the formatted description with \*\*these\*\* to mark bold text.
  description: string,
  // eg address, confirmation-statement, accounts
  filingType: string,
  // this is like created, changed, appointments, terminations etc
  subcategory?: string
}

// export interface RecentFilings {
//   // filing type is the heading that the items will be put under
//   [filingType: string]: RecentFilingsItem[]
// }

// this was introduced to replace the previous data structure so that groupings can be determined dynamically on the client.
// A user might want to group by date bucket, or filing type, or company number etc.
export type RecentFilings = RecentFilingsItem[]
