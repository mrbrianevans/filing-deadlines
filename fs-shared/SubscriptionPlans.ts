

export enum SubscriptionPlans{
  BASIC = "BASIC",
  PREMIUM = "PREMIUM"
}


// these are features that can be enabled/disabled or restricted for various plans.
interface Features{
  recentFilingsMaxPeriod: string,
  registeredOfficeAddressChecker: boolean,
  accountsDashboardMaxPeriod: string
  confirmationStatementsMaxPeriod: string
  organisationMaxMembers: number,
  webNotifications: boolean,
  clientListMaxSize: number
}

// these should be checked on the server and the client to display only valid options to user, but also prevent custom requests.
// these could be stored in Redis and retrieved every time, rather than having them directly in the source code.
export const SubscriptionPlanFeatures: Record<SubscriptionPlans, Features> = {
  [SubscriptionPlans.BASIC]: {
    accountsDashboardMaxPeriod: 'P31D',
    clientListMaxSize: 100,
    confirmationStatementsMaxPeriod: 'P7D',
    organisationMaxMembers: 2,
    recentFilingsMaxPeriod: 'P7D',
    registeredOfficeAddressChecker: false,
    webNotifications: false
  },
  [SubscriptionPlans.PREMIUM]: {
    accountsDashboardMaxPeriod: 'P2Y',
    clientListMaxSize: 500,
    confirmationStatementsMaxPeriod: 'P2Y',
    organisationMaxMembers: 20,
    recentFilingsMaxPeriod: 'P1Y',
    registeredOfficeAddressChecker: true,
    webNotifications: true
  }
}
