
export enum FeedbackType{
FEATURE_REQUEST='feature-request',
 ENHANCEMENT='enhancement',
 COMMENT='comment',
  PROBLEM="problem"
}

export interface Feedback extends Record<string,string>{
  title: string,
  description: string,
  feedbackType: FeedbackType
}

export enum FeedbackStatus{
  UNREVIEWED = "UNREVIEWED",REVIEWED = "REVIEWED", ACCEPTED = "ACCEPTED",REJECTED = "REJECTED",RESOLVED = "RESOLVED"
}

export interface StoredFeedback extends Feedback{
  userId: string
  requestedAt: string
  status: FeedbackStatus
}
