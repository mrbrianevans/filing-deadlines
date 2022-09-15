import {RedisClient} from "bullmq";
import {writeFile,mkdir} from "fs/promises";


// can be used to backup client lists before applying a data migration
export async function backupClientLists(redis: RedisClient){
  const clientLists = await redis.keys('org:*:clients')
  await mkdir('backups', {recursive: true})
  for(const clientList of clientLists){
    const clients = await redis.hkeys(clientList)
    const name = `backups/${Date.now()}_${clientList}.json`
    const content = JSON.stringify(clients)
    await writeFile(name, content)
    console.log("Wrote", clients.length, 'clients to', name, 'for backup')
  }
}
