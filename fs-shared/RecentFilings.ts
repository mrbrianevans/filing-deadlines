

export interface RecentFilingsItem {
  filingDate: string,
  companyNumber: string,
  transactionId: string
  companyName: string,
  description: string,
}

export interface RecentFilings {
  // filing type is the heading that the items will be put under
  [filingType: string]: RecentFilingsItem[]
}
