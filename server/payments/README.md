 # Payments and subscriptions
 
## User flow
1. User visits website for the first time
2. Sign in with Xero
3. Goes to create organisation
4. Creating organisation requires choosing a name
5. After an organisation is created, the manage org page shows the Stripe pricing table with different plans.
6. The user can't perform any organisation actions until they have subscribed to a plan. The manage org page only shows the pricing table.
7. Once a user has subscribed to a plan, Stripe triggers a webhook which updates their profile and organisation, and gives them access to the features in their plan.
8. The user can invite others to join their organisation, but others cannot edit payment/plan details.
9. The user can manage their billing via a link on the organisation page to the Stripe Billing Portal.

## Requirements
- manage org page must show pricing table if no plan is subscribed to
- current users org subscription must be included in $user store in Svelte 
- Stripe billing portal link must be shown in "Manage organisation" page
- subscription related webhook events must be listened for
- customer info such as Stripe Customer ID and subscription status and plan must be stored in Redis


## Guidance on tracking active subscriptions
[Official documentation](https://stripe.com/docs/billing/subscriptions/webhooks#active-subscriptions)

 - when a user initially checks out, set a key in Redis `org:{orgId}:subscriptionActiveUntil` to the current date.
 - when a user logs in, check that `org:{orgId}:subscriptionActiveUntil` is a future date
 - when a subscription is renewed (invoice paid), update `org:{orgId}:subscriptionActiveUntil` to current date.
 - give a few days of leeway


## Redis keys
 - `org:{orgId}:plan` the plan that this organisation is subscribed to (enum value), set when a Stripe subscription is updated
 - `org:{orgId}:subscriptionActiveUntil` the date that the organisations plan expires, set when a Stripe subscription is updated
 - `user:{userId}:customerId` the Stripe customer ID of the user. Don't actually know if this is needed?
 - ?

## Session variables
 - `orgPlan`, this should be set when the user signs in, based on the expiry date of the org's subscription

