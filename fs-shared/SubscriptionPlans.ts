
// intentionally different values to ensure that the correct form is used when persisting
export enum SubscriptionPlans{
  BASIC = "basicPlan",
  STANDARD = "standardPlan"
}


// these are features that can be enabled/disabled or restricted for various plans.
export interface Features{
  recentFilingsMaxPeriod: string,
  registeredOfficeAddressChecker: boolean,
  accountsDashboardMaxPeriodMonths: number
  confirmationStatementsMaxPeriod: string
  organisationMaxMembers: number,
  webNotifications: boolean,
  clientListMaxSize: number
}

// these should be checked on the server and the client to display only valid options to user, but also prevent custom requests.
// these could be stored in Redis and retrieved every time, rather than having them directly in the source code.
export const SubscriptionPlanFeatures: Record<SubscriptionPlans|'undefined', Features> = {
  // default features allowed for users who don't have any plan. deny everything. this can also be while plan is loading.
  undefined: {
    accountsDashboardMaxPeriodMonths: 0,
    clientListMaxSize: 0,
    confirmationStatementsMaxPeriod: 'P0D',
    organisationMaxMembers: 0,
    recentFilingsMaxPeriod: 'P0D',
    registeredOfficeAddressChecker: false,
    webNotifications: false
  },
  [SubscriptionPlans.BASIC]: {
    accountsDashboardMaxPeriodMonths: 1,
    clientListMaxSize: 100,
    confirmationStatementsMaxPeriod: 'P7D',
    organisationMaxMembers: 2,
    recentFilingsMaxPeriod: 'P7D',
    registeredOfficeAddressChecker: false,
    webNotifications: false
  },
  [SubscriptionPlans.STANDARD]: {
    accountsDashboardMaxPeriodMonths: 24,
    clientListMaxSize: 500,
    confirmationStatementsMaxPeriod: 'P2Y',
    organisationMaxMembers: 20,
    recentFilingsMaxPeriod: 'P1Y',
    registeredOfficeAddressChecker: true,
    webNotifications: true
  }
}
