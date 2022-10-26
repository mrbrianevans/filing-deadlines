import jwtDecode from "jwt-decode";


export interface IdTokenUser{ name: string; issuedAt: Date; userId: string; expiresAt: Date; email: string; issuer: "https://dev-filingdeadlines.eu.auth0.com/" | "https://identity.xero.com" }

// decodes the id token stored at `user:${userId}:id`
export function getUserFromIdToken(idToken: string): IdTokenUser {
  const idTokenDecoded = jwtDecode(idToken) as IdToken
  return {
    // because initially, xero_userid was used, it must remain for backwards compatibility. until a migration is done.
    userId: "xero_userid" in idTokenDecoded ? idTokenDecoded.xero_userid : idTokenDecoded.sub,
    name: idTokenDecoded.name,
    issuedAt: new Date(idTokenDecoded.iat*1000),
    expiresAt: new Date(idTokenDecoded.exp*1000),
    email: idTokenDecoded.email,
    issuer: idTokenDecoded.iss
  }
}

export function decodeXeroAccessToken(accessToken: string){
  return jwtDecode(accessToken) as XeroAccessToken
}
export function decodeAuth0AccessToken(accessToken: string){
  return jwtDecode(accessToken, {header: true}) as Auth0AccessToken
}


export interface XeroIdToken {
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

export interface XeroAccessToken {
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

interface Auth0AccessToken{
  alg: 'dir',
  enc: 'A256GCM',
  iss: 'https://dev-filingdeadlines.eu.auth0.com/'
}

interface Auth0IdToken{
  nickname: string,
  name: string,
  picture: string,
  updated_at: string,
  email: string,
  email_verified: boolean,
  iss: 'https://dev-filingdeadlines.eu.auth0.com/',
  sub: string,
  aud: string,
  iat: number,
  exp: number,
  sid: string
}

export type AccessToken = Auth0AccessToken | XeroAccessToken
export type IdToken = XeroIdToken | Auth0IdToken
