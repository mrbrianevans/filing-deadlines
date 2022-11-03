import type {FastifyInstance, FastifyPluginAsync, FastifySchema} from "fastify";
import type {PushSubscription} from 'web-push'
import webPush from 'web-push'
import {notificationNames} from '../../fs-shared/Notifications.js'
import {sendWebNotification, WebNotification} from '../../backend-shared/notifications/sendWebNotification.js'
import { formatFilingNotification } from "../../backend-shared/notifications/formatFilingNotification.js";
import assert from "assert";
import type { FilingHistoryItemResource } from "../../backend-shared/companiesHouseApi/getFilingHistoryFromApi.js";

const setPreferenceSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      notificationName: {type:'string', enum: Object.values(notificationNames)}
    },
    required: ['notificationName']
  },
  body: {
    type: 'boolean'
  }
}
const setPermissionsSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      permission: {type:'string', enum: ['granted', 'denied', 'default']}
    },
    required: ['permission']
  }
}
const setSubscriptionSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      endpoint: {type:'string', format: 'url'},
      keys: {
        type: 'object',
        properties: {
          p256dh: {type:'string'},
          auth: {type:'string'}
        },
        required: ['auth', 'p256dh']
      }
    },
    required: ['endpoint', 'keys'],
    additionalProperties: true // can contain expirationTime etc
  }
}

// these are added asynchronously when the plugin is first registered.
interface DecoratedFastifyInstance extends FastifyInstance{
  publicVapidKey: string
  privateVapidKey: string
}

const NotificationsPlugin: FastifyPluginAsync = async (fastify: DecoratedFastifyInstance, opts) => {
  setupVapidKeys: {
    // check for VAPID keys in Redis, generate if not exists
    const publicExists = await fastify.redis.exists(`notifications:vapidKeys:public`)
    const privateExists = await fastify.redis.exists(`notifications:vapidKeys:private`)
    assert.equal(publicExists, privateExists, 'Public and private VAPID key mismatch. Only one exists: ' + JSON.stringify({
      publicExists,
      privateExists
    }))
    if (!publicExists || !privateExists) {
      fastify.log.warn('Creating new set of VAPID keys for sending Push Notifications')
      // create and save VAPID keys in Redis
      const keys = webPush.generateVAPIDKeys()
      await fastify.redis.set(`notifications:vapidKeys:public`, keys.publicKey)
      await fastify.redis.set(`notifications:vapidKeys:private`, keys.privateKey)
    }
    const publicVapidKey = await fastify.redis.get(`notifications:vapidKeys:public`)
    const privateVapidKey = await fastify.redis.get(`notifications:vapidKeys:private`)
    fastify.decorate('publicVapidKey', publicVapidKey)
    fastify.decorate('privateVapidKey', privateVapidKey)
  }

  // save preference in redis for this user
  fastify.post<{Body:boolean, Params: {notificationName:string}}>('/preference/:notificationName', {schema:setPreferenceSchema}, async (request, reply)=>{
    const enabled = request.body
    const {notificationName} = request.params
    request.log.info({notificationName, enabled}, 'User updated notification preference')
    if(request.org?.features.webNotifications || !enabled) {
      await fastify.redis.hset(`user:${request.session.userId}:notifications:preferences`, notificationName, JSON.stringify(enabled))
      reply.status(204).send()
    }else{
      return reply.wrongPlan('Your subscription plan does not include notifications.')
    }
  })

  // get preferences from redis for this user and return them
  fastify.get('/preferences', async (request, reply)=>{
    const preferences = await fastify.redis.hgetall(`user:${request.session.userId}:notifications:preferences`)
    return Object.fromEntries(Object.entries(preferences).map(p=>[p[0], JSON.parse(p[1])]))
  })

  // set the users notification permission when they update it in the web-browser
  fastify.post<{Body: {permission:'granted'|'default'|'denied'}}>('/permissions', {schema: setPermissionsSchema},async (request, reply)=>{
    const userAgent = request.headers["user-agent"]
    const {permission} = request.body
    request.log.info({userAgent, permission},'User updated notification permissions')
    // save user permission with user agent, because permission is specific to user agent (eg device)
    await fastify.redis.hset(`user:${request.session.userId}:notifications:permission`, {userAgent, permission, accurateAt: new Date().toISOString()})
    reply.status(204).send()
  })

  // the client needs the public key to get a subscription
  fastify.get('/vapidKey', async (request, reply)=>{
    // cant just return it, because fastify doesn't serialise it as a JSON string with double quotes
    reply.status(200).send(JSON.stringify(fastify.publicVapidKey))
  })

  // when a user grants notification permission, the Push Subscription is sent to this endpoint
  fastify.post<{Body: PushSubscription}>('/subscription', {schema: setSubscriptionSchema}, async (request, reply)=>{
    const subscription = request.body
    const origin = new URL(subscription.endpoint).origin
    request.log.info({origin},'User set notification subscription for Push API')
    await fastify.redis.set(`user:${request.session.userId}:notifications:subscription`, JSON.stringify(subscription))
    reply.status(204).send()
  })

  // duplicated from RecentFilingsPlugin
  async function getFilingByCompanyNumberTransactionId(companyNumberTransactionId: string): Promise<FilingHistoryItemResource&{companyNumber:string}>{
    const matches = companyNumberTransactionId.match(/^([A-Z\d]{8}):([a-zA-Z\d]{10,})$/)
    if(!matches) throw new Error('Key does not match expected format: "'+companyNumberTransactionId+'". Should be companyNumber:transactionId')
    const [,companyNumber, transactionId] = matches
    const filingString = await fastify.redis.hget(`company:${companyNumber}:filingHistory`, transactionId)
    if(!filingString) fastify.log.error({companyNumber, transactionId, companyNumberTransactionId, filingString}, 'Did not find expected filing transaction')
    const transaction = <FilingHistoryItemResource>JSON.parse(filingString??`{"transaction_id":"${transactionId}"}`)
    return Object.assign(transaction, {companyNumber})
  }


  // for a user to test a server-sent notification
  fastify.get('/test', async (request, reply)=>{
    const userSubscription: PushSubscription|undefined = await fastify.redis.get(`user:${request.session.userId}:notifications:subscription`).then(JSON.parse)
    request.log.info({hasSubscription: Boolean(userSubscription)}, 'User requested a test web push notification')
    if(userSubscription) {
      try {
        const companyNumberTransactionId = await fastify.redis.zrange(`org:${request.session.orgId}:clientFilings`, -1, -1)
        const filingEvent = companyNumberTransactionId.length ? await getFilingByCompanyNumberTransactionId(companyNumberTransactionId[0]) : await getRandomFilingEvent()
        const companyName = await fastify.redis.get(`company:${filingEvent.companyNumber}:profile`).then(c => JSON.parse(c ?? '{"company_name":"Company name"}').company_name)
        const notification = formatFilingNotification(filingEvent.companyNumber, companyName, filingEvent)
        await sendWebNotification({userId: request.session.userId, notification})
        return {sent: true}
      }catch (e) {
        reply.sendError({error: 'Failed to send notification', message: e.message, statusCode: 500})
      }
    }else{
      return reply.sendError({error: 'Permission not granted', message: 'You haven\'t granted permission to show notifications, so you can\'t get a test notification sent', statusCode: 400})
    }
  })

}

export default NotificationsPlugin

// for when a user tests notifications
async function getRandomFilingEvent(): Promise<FilingHistoryItemResource&{companyNumber:string}>{
  return {
    companyNumber: '00000295',
    // action_date: '2020-11-20',
    category: 'accounts',
    date: '2020-12-03',
    description: 'accounts-with-accounts-type-total-exemption-full',
    description_values: { made_up_date: '2020-11-20' },
    links: {
      self: '/company/00000295/filing-history/MzI4NTEzMDM5MWFkaXF6a2N4',
      document_metadata: 'https://frontend-doc-api.company-information.service.gov.uk/document/L54REOdV_5k1Qe0EctxElJ8BaReUa01VD01xLNM7qDc'
    },
    type: 'AA',
    pages: 9,
    barcode: 'X9J5CBWQ',
    transaction_id: 'MzI4NTEzMDM5MWFkaXF6a2N4'
  }
}
