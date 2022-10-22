import {derived} from "svelte/store";
import { SubscriptionPlanFeatures} from "../../../../fs-shared/SubscriptionPlans.js";
import {user} from "./user.js";

/** The available features to the current user, based on their organisations subscription plan. Use with $features.name */
export const features = derived(user, (u)=> SubscriptionPlanFeatures[u.orgPlan], SubscriptionPlanFeatures['undefined'])

// todo:
//  also only want to show pages which are permitted for the users plan
//  eg:
//   only show the notifications page in the navbar and recent filings link if its enabled for the plan
//   if the user manually navigates to the page, show a generic banner that says they need to upgrade to get access
//   could still show links but make them disabled with a tooltip/badge
