

export interface RecentFilingsItem {
  filingDate: string,
  companyNumber: string,
  companyName: string,
  description: string,
  link: string
}

export interface RecentFilings {
  // filing type is the heading that the items will be put under
  [filingType: string]: RecentFilingsItem[]
}
