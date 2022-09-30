

 # Organisation management
 
This feature is to allow users to share a client list (and therefore dashboard) within their organisation. 

The main idea is that every user is a part of zero or one organisation. 
When a user first signs in (signs up), they are not a part of any organisation.
They can either be invited to join someone else's organisation, or they can create a new one.
*Only the owner of an organisation can add and remove other members.* 
When a user is invited, they get a notification the next time they log in, allowing them to accept or reject the invite.

## URL heirarchy

- `/api/user/org` can be accessed by any logged-in user, and relates to organisations.
- `/api/user/org/member` can only be accessed by users who are members of an organisation.
- `/api/user/org/member/owner` can only be accessed by users who are owners of an organisation.


---

Required operations indicated with an asterix. 
Other operations are nice-to-haves that would make it fully feature complete, but aren't required in the MVP.


## * Creating a new org
To create a new organisation, the user only needs to provide a name for the organisation. 
Name must be unique to avoid confusion with invites.

Endpoint: 
```http request
POST /api/user/org

{ "name": "My Organisation Name" }
``` 
Upon creation, a random orgId is generated, and these keys are set in Redis:
- `org:{orgId}:name` the name provider by the creating user
- `org:{orgId}:owner` the userId of the user who created the organisation (they are the owner)
- `org:{orgId}:members` a Hash of email addresses to invite statuses, initialised to only the owner (who cannot be removed)
- `org:{orgId}:activeMembers` a Set of userIds of the active members in an organisation
- `org:{orgId}:clients` the client list hash for this organisation, not initialised to any value (starts empty).

Set the orgId on the user's session, and the users orgId key in Redis (`user:{userId}:org`=`orgId`).
Also set a session variable and Redis key to indicate that this user is the owner, allowing them more privileges.

## * Inviting a user to an org
Only the owner can invite other members to join their organisation. 
A user can only have one pending invite at a time, stored in `invite:{email}` as a Hash.

Endpoint:
```http request
POST /api/user/org/member/owner/add

{"email": "name@org.com"}
```
Assert that the requesting user is the organisation owner.

If the user already has a pending invite, reject this request.

Add the new email address to the Hash of org members (`org:{orgId}:members`) as status pending invite.

Add an invitation for the user at `invite:{email}` as a Hash of something like `{invitedBy, orgId, date}`.

Whenever a person logs in, this key must be checked and if it exists, then perhaps put something in the URL to 
indicate that there is a pending invite, and so the frontend knows to show something to the user, offering for
them to either accept or reject the invitation. 

## * Accept invitation
If a user clicks accept on the invitation, then this endpoint should be called.

Endpoint:
```http request
PUT /api/user/org/acceptInvitation?orgId={orgId}
```

Even though there is only one invite, the orgId is included in the request to prevent race conditions. Assert equals orgId.

The action required is to clear the pending invite (`DEL` `invite:{email}`), and to set the user orgId (`user:{userId}:org`).

Update the org member list to reflect that the invitation is accepted, and add the userId to `org:{orgId}:activeMembers`.

## Reject invitation
If a user clicks reject on the invitation, then this endpoint should be called.

Endpoint:
```http request
DELETE /api/user/org/reject?orgId={orgId}
```
Assert equals orgId in request to orgId in Redis invite Hash.

The action required is to clear the pending invite (`DEL` `invite:{email}`).

Update the org member list to reflect that the invitation is rejected.

## Removing a user from an org
Only the owner can remove members from their organisation.

When a user is removed, the organisations members Hash (`org:{orgId}:members`) must be updated to status removed, 
and their orgId (`user:{userId}:org`) must be removed. The userId must be removed from `org:{orgId}:activeMembers`.
If the user had not yet accepted the invitation, their invite must also be removed (`invite:{email}`).

Assert that the user being removed is NOT the owner of the organisation, and that the user requesting the removal IS the owner.

## Leaving an organisation
A user can choose to leave an organisation after accepting an invitation.

This will nullify the users orgId (`user:{userId}:org`) and update the org member list (`org:{orgId}:members`) to status left.
The userId must be removed from `org:{orgId}:activeMembers`.

## Deleting an organisation
The owner of an organisation can delete their organisation, removing all members and client list and any associated data.
