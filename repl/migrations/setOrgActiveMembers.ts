import type {RedisClientType} from '../../backend-shared/getRedisClient.js'

/**
 * Loops through users, getting their organisation and adding their userId to that organisations "activeMembers" Set.
 */
export async function setOrgActiveMembers(redis: RedisClientType){

  const userKeys = redis.scanStream({match:'user:*:org'})
  for await(const users of userKeys){
    const userArray = users instanceof Array ? users: [users]
    for(const user of userArray){
      const match = user.match(/user:(.+):org/)
      if(match) {
        const [,userId] = match
        const orgId = await redis.get(user)
        await redis.sadd(`org:${orgId}:activeMembers`, userId)
      }else console.log('Key doesn\'t match expected format: ', user)
    }
  }

}
