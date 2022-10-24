
// intentionally different values to ensure that the correct form is used when persisting
export enum SubscriptionPlans{
  BASIC = "basicPlan",
  STANDARD = "standardPlan"
}


// these are features that can be enabled/disabled or restricted for various plans.
export interface Features{
  recentFilingsMaxPeriodDays: number,
  registeredOfficeAddressChecker: boolean,
  accountsDashboardMaxPeriodMonths: number
  confirmationStatementsMaxPeriodDays: number
  organisationMaxMembers: number,
  webNotifications: boolean,
  clientListMaxSize: number,
  exportData: boolean
}

// these should be checked on the server and the client to display only valid options to user, but also prevent custom requests.
// these could be stored in Redis and retrieved every time, rather than having them directly in the source code.
export const SubscriptionPlanFeatures: Record<SubscriptionPlans|'undefined', Features> = {
  // default features allowed for users who don't have any plan. deny everything. this can also be while plan is loading.
  undefined: {
    accountsDashboardMaxPeriodMonths: 0,
    clientListMaxSize: 0,
    confirmationStatementsMaxPeriodDays: 0,
    organisationMaxMembers: 0,
    recentFilingsMaxPeriodDays: 0,
    registeredOfficeAddressChecker: false,
    webNotifications: false,
    exportData: false
  },
  [SubscriptionPlans.BASIC]: {
    accountsDashboardMaxPeriodMonths: 1,
    clientListMaxSize: 100,
    confirmationStatementsMaxPeriodDays: 7,
    organisationMaxMembers: 2,
    recentFilingsMaxPeriodDays: 7,
    registeredOfficeAddressChecker: false,
    webNotifications: false,
    exportData: false
  },
  [SubscriptionPlans.STANDARD]: {
    accountsDashboardMaxPeriodMonths: 24,
    clientListMaxSize: 500,
    confirmationStatementsMaxPeriodDays: 365,
    organisationMaxMembers: 20,
    recentFilingsMaxPeriodDays: 365,
    registeredOfficeAddressChecker: true,
    webNotifications: true,
    exportData: true
  }
}
