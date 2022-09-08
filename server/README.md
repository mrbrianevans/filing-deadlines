# Filing deadlines server component

## Endpoints
All endpoints are prefixed with `/api`.

### Authenticated endpoints
Once a user has logged in, they can access `/api/user/*` endpoints. 
A client who is not logged in cannot access these, defined in the [`auth/UserPlugin.ts`](auth/UserPlugin.ts).

#### Data endpoints

##### `/api/user`
Fetch current user profile.

##### `/api/user/client-list`
Fetch the client list of the current user.

###### `/api/user/client-list/:clientId` 
`PUT` to add a client, `DELETE` to remove a client.

##### `/api/user/dashboard`
Fetch the dashboard data for the current user.

###### `/api/user/dashboard/:id`
Fetch the profile of a company in the dashboard (for expanded details).

## Redis

Users are stored in `user:{userId}` under 3 suffixes for different token types: `id`, `access_token` and `refresh_token`.

Client lists are stored in `user:{userId}:clients` as a Redis Hash of `id => JSON([Object Client])`.

Client company profiles from Companies House are stored in `company:{clientId}:profile` and filing history in `company:{clientId}:filingHistory`, both as stringified JSON. 
Because this data is from Companies House, it is shared between users.


## Session
The `userId` of the currently logged-in user is stored on the session object. This can be used to retrieve the user profile from Redis.
