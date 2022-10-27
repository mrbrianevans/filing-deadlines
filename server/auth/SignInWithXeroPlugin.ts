import type {FastifyPluginAsync} from "fastify";
import { getEnv } from '../../backend-shared/utils.js'
import {decodeXeroAccessToken, getUserFromIdToken} from "../../backend-shared/jwtTokens.js";
import {doSignIn} from "./doSignIn.js";

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
    try{
      const {token} = await this.xeroOauth.getAccessTokenFromAuthorizationCodeFlow(request)
      const {access_token, id_token, refresh_token} = token
      const accessToken = decodeXeroAccessToken(access_token)
      const redirectUrl = await doSignIn({accessToken, id_token, refresh_token, request, fastify, provider: 'xero'})
      reply.redirect(redirectUrl)
    }catch (e) {
      // this can be triggered by state not matching, in which case, it's better to direct the user to the homepage than show the error.
      request.log.error(e, "Error signing user in with Xero")
      reply.redirect('/')
    }
  })

}


export default SignInWithXeroPlugin
