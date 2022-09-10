export enum OrgMemberStatus {
  pendingInvite = 'pending-invite',
  acceptedInvite = 'accepted-invite',
  rejectedInvite = 'rejected-invite',
  owner = 'owner',
  // voluntarily chose to leave organisation
  left = 'left',
  // kicked out of organisation by owner
  removed = 'removed'
}

// an invitation to an organisation. Stored in invite:{userEmail}
export interface Invite{orgId: string, invitedByName: string, invitedOn: string}
