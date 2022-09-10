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
export interface Invite{orgId: string, orgName: string, invitedByName: string, invitedOn: string}


export const OrgMemberStatusPretty: Record<OrgMemberStatus, string> = {
  "pending-invite": "Pending invitation",
  "accepted-invite": "Accepted invitation, member",
  "rejected-invite": "Rejected invitation",
  owner: "Organisation owner",
  left: "Left organisation",
  removed: "Removed from organisation"
}
