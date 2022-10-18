 # Payments and subscriptions
 
## User flow
1. User visits website for the first time
2. Sign in with Xero
3. Goes to create organisation
4. Creating organisation requires choosing a name and a subscription plan 
5. The user subscribes to the Stripe Product at the time of creating the organisation. This can be a trial.
6. The user can invite others to join their organisation, but others cannot edit payment/plan details.
7. The user can manage their billing via a link on the organisation page.

## Requirements
- checkout must be integrated with creating an organisation (redirection to Stripe)
- Stripe billing portal link must be shown in "Manage organisation" page
- subscription related webhook events must be listened for
- customer info such as Stripe Customer ID and subscription status and plan must be stored in Redis


## Guidance on tracking active subscriptions
[Official documentation](https://stripe.com/docs/billing/subscriptions/webhooks#active-subscriptions)

 - when a user initially checks out, set a key in Redis `org:{orgId}:subscriptionActiveUntil` to the current date.
 - when a user logs in, check that `org:{orgId}:subscriptionActiveUntil` is a future date
 - when a subscription is renewed (invoice paid), update `org:{orgId}:subscriptionActiveUntil` to current date.
 - give a few days of leeway
