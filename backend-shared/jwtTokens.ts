import jwtDecode from "jwt-decode";

// decodes the id token stored at `user:${userId}:id`
export function getUserFromIdToken(idToken: string){
  return jwtDecode(idToken) as IdToken
}
export function decodeAccessToken(accessToken: string){
  return jwtDecode(accessToken) as AccessToken
}

export interface IdToken {
  nbf: number,
  exp: number,
  iss: 'https://identity.xero.com',
  aud: string,
  iat: number,
  at_hash: string,
  sid: string,
  sub: string,
  auth_time: number,
  xero_userid: string,
  global_session_id: string,
  preferred_username: string,
  email: string,
  given_name: string,
  family_name: string,
  name: string,
  amr: string[]
}

export interface AccessToken {
  nbf: number,
  exp: number,
  iss: 'https://identity.xero.com',
  aud: 'https://identity.xero.com/resources',
  client_id: string,
  sub: string,
  auth_time: number,
  xero_userid: string,
  global_session_id: string,
  jti: string,
  authentication_event_id: string,
  scope: string[],
  amr: string[]
}
