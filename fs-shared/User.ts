import {SubscriptionPlans} from "./SubscriptionPlans.js";

export interface User{
  id: string
  name: string,
  email?: string,
  orgName?: string,
  owner?: boolean
  orgPlan?: SubscriptionPlans | null
}
