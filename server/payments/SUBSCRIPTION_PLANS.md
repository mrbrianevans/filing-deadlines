# Subscription plans
Subscription plans grant users access to features depending on which plan their organisation is subscribed to.

A user who is not in an organisation, or whose organisation has not subscribed to any plan is given access to very little on the website. 
The bare minimum to allow them to create/join an org and start a plan.

When a user signs in, their plan is checked on the server and set on their session. 
The only other time this is changed, is when a payment is successful, the success screen updates their plan.

On the frontend, the organisation plan for the current user is stored in the `$user` Svelte store as `orgPlan`.

## Feature restrictions
To restrict usage of unauthorised features, the backend rejects requests that would violate the quotas.

In order to improve the user experience, the frontend should only ever show valid options for the user. 
For example, the navbar shouldn't show pages that the user doesn't have access to. 
The frontend should never send requests that get rejected for this reason. 

### Backend
On the server, the `request.org.features` object can be used to check the current users feature quotas. 
This should always be checked (on relevant endpoints) BEFORE performing any other logic.

If the user cannot perform the action because it would take them over their plan's quota, the server must reject the request with a `403` status code.

If the client ever receives a 403 status code, an error should be logged to the server. This should never happen, but could happen in certain circumstances (eg multiple users making changes at the same time).
