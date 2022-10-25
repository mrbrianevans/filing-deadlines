import {derived} from "svelte/store";
import { SubscriptionPlanFeatures} from "../../../../fs-shared/SubscriptionPlans.js";
import {user} from "./user.js";

/** The available features to the current user, based on their organisations subscription plan. Use with $features.name */
export const features = derived(user, (u)=> SubscriptionPlanFeatures[u?.orgPlan] ?? SubscriptionPlanFeatures['undefined'], SubscriptionPlanFeatures['undefined'])

