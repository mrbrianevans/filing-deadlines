import type {FastifyPluginAsync, FastifySchema} from "fastify";
import {notificationNames} from '../../fs-shared/Notifications.js'

const setPreferenceSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      notificationName: {type:'string', enum: Object.values(notificationNames)}
    }
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
    }
  }
}

const NotificationsPlugin: FastifyPluginAsync = async (fastify, opts) => {

  fastify.post<{Body:boolean, Params: {notificationName:string}}>('/preference/:notificationName', {schema:setPreferenceSchema}, async (request, reply)=>{
    const enabled = request.body
    const {notificationName} = request.params
    request.log.info({notificationName, enabled}, 'User updated notification preference')
    // save preference in redis for this user
    await fastify.redis.hset(`user:${request.session.userId}:notifications:preferences`, notificationName, JSON.stringify(enabled))
    reply.status(204).send()
  })

  fastify.get('/preferences', async (request, reply)=>{
    // get preferences from redis for this user and return them
    const preferences = await fastify.redis.hgetall(`user:${request.session.userId}:notifications:preferences`)
    return Object.fromEntries(Object.entries(preferences).map(p=>[p[0], JSON.parse(p[1])]))
  })

  fastify.post<{Body: {permission:'granted'|'default'|'denied'}}>('/permissions', {schema: setPermissionsSchema},async (request, reply)=>{
    // set the users notification permission when they update it in the web-browser
    const userAgent = request.headers["user-agent"]
    const {permission} = request.body
    request.log.info({userAgent, permission},'User updated notification permissions')
    // save user permission with user agent, because permission is specific to user agent (eg device)
    await fastify.redis.hset(`user:${request.session.userId}:notifications:permission`, {userAgent, permission, accurateAt: new Date().toISOString()})
    reply.status(204).send()
  })

  fastify.post('/setToken', {}, async (request, reply)=>{

  })

}

export default NotificationsPlugin
