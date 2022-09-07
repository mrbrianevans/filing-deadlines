import {FastifyPluginAsync} from "fastify";
import jwtDecode from "jwt-decode";
import {AccessToken, IdToken} from "../types/token.js";
import { getEnv } from '../../backend-shared/utils.js'

const userScopes = ['openid', 'profile', 'email']
const redirectUrl = getEnv('XERO_REDIRECT_URL')

const SignInWithXeroPlugin: FastifyPluginAsync = async (fastify, opts) => {

  // @ts-ignore
  fastify.register(import("@fastify/oauth2"), {
    name: 'xeroOauth',
    credentials: {
      client: {
        id: getEnv('XERO_CLIENT_ID'),
        secret: getEnv('XERO_CLIENT_SECRET')
      },
      auth: {
        authorizeHost: 'https://login.xero.com',
        authorizePath: '/identity/connect/authorize',
        tokenHost: 'https://identity.xero.com',
        tokenPath: '/connect/token'
      }
    },
    scope: userScopes,
    startRedirectPath: '/', // registers the route to redir user to
    callbackUri: redirectUrl
  })

  fastify.get('/callback', async function(request,reply){
    const {token} = await this.xeroOauth.getAccessTokenFromAuthorizationCodeFlow(request)
    const {access_token, id_token} = token
    const decodedAccessToken = jwtDecode(access_token) as AccessToken
    const decodedIdToken = jwtDecode(id_token) as IdToken
    request.session.userId = decodedIdToken.xero_userid
    //todo: store user details in redis
    reply.redirect('/') // back home after signing in
  })

}


export default SignInWithXeroPlugin
