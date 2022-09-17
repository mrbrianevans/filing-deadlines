
export interface FeatureRequest extends Record<string,string>{
  featureTitle: string,
  featureDescription: string
}

export interface StoredFeatureRequest extends FeatureRequest{
  userId: string
  requestedAt: string
  // todo: also have a status for request features. unreviewed => reviewed => accepted/rejected => implemented
}
