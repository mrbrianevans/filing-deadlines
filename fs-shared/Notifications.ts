

// naming convention is `{method of notification eg web,email}-{subscription content}`
export const notificationNames = {webFilings: 'web-filings', emailFilings: 'email-filings', emailUpcomingAccountsDeadlines: 'email-upcomingAccountsDeadlines', emailUpcomingConfStatDeadlines: 'email-upcomingConfirmationStatementDeadlines'}


export type NotificationPreferences = Record<keyof typeof notificationNames, boolean>
