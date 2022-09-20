import {start} from 'node:repl'
import { Queue, QueueEvents } from "bullmq";
import { getRedisClient } from "../backend-shared/getRedisClient.js";
import {
  dispatchLoadFilingHistoryForCompany,
  dispatchLoadFilingHistoryForClientList,
  dispatchReloadClientListDetails,
  dispatchReloadClientListDetailsSync,
  dispatchReloadCompanyProfiles,
  dispatchJobSync
} from "../backend-shared/jobs/dispatchJobs.js";
import {
  bullConnection,
  loadFilingHistoryForClientListQueue, loadFilingHistoryForCompanyQueue,reloadClientListQueue,reloadCompanyProfilesQueue
} from '../backend-shared/jobs/queueNames.js'
import {backupClientLists} from "./backupClientLists.js";
import {getFeatureRequests} from "./getFeatureRequests.js";
import {getUser} from "./getUserAndOrg.js";

if(process.argv.slice(1).includes('--help')) console.log("This is a custom repl for managing the database and queues. Try\n\n\t" +
  "docker compose exec repl node index.js")


const server = start({
  prompt: '$ '
})

const queueNames = [loadFilingHistoryForClientListQueue,loadFilingHistoryForCompanyQueue,reloadClientListQueue,reloadCompanyProfilesQueue]
const queues = Object.fromEntries(queueNames.map(q=>[q, new Queue(q, {connection: bullConnection})]))
const redis = await getRedisClient()
server.context.redis = redis
server.context.queues = queues
server.context.Queue = Queue
server.context.QueueEvents = QueueEvents
server.context.queueNames = queueNames

server.context.backupClientLists = ()=>backupClientLists(redis)
server.context.getFeatureRequests = ()=>getFeatureRequests(redis)
server.context.getUser = (userId: string)=>getUser(redis, userId)

server.context.exit = ()=>{shutdown('exit()');return 'exiting...'} // could be a Proxy to allow for simply "exit" rather than "exit()"

server.context.dispatchJobSync = dispatchJobSync // to wait for response
server.context.d = {dispatchLoadFilingHistoryForCompany, dispatchLoadFilingHistoryForClientList,dispatchReloadClientListDetails,dispatchReloadClientListDetailsSync,dispatchReloadCompanyProfiles}

server.defineCommand('q', {
  action() {
    this.clearBufferedCommand()
    console.log('Try await queues[<name>].getMetrics() where <name> is one of these: ' + queueNames.join(', '))
    console.log('Or use d.dispatch[QueueName] as a convenient way to dispatch a job')
    this.displayPrompt()
  },
  help: 'Get help with using queues'
})
server.on('exit', shutdown) // when the user types .exit or Ctrl+D
process.on('SIGINT', shutdown) // quit on ctrl-c when running docker in terminal
process.on('SIGTERM', shutdown)// quit properly on docker stop
async function shutdown(sig?: string){
  console.log("Thank you for using the custom REPL :)")
  console.info('Graceful shutdown commenced', new Date().toISOString(), sig);
  const timeout = setTimeout(()=>process.exit(1), 10_000) // just in case
  await Promise.all(Object.values(queues).map(q=>q.close()))
  await redis.quit()
  clearTimeout(timeout)
  console.info('Graceful shutdown finished', new Date().toISOString());
  process.exit(0)
}
