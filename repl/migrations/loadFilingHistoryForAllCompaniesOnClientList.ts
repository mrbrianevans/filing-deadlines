import {RedisClient} from "bullmq";
import {dispatchLoadFilingHistoryForCompany} from "../../backend-shared/jobs/dispatchJobs.js";
import {setTimeout} from "timers/promises";

export async function loadFilingHistoryForAllCompaniesOnClientList(orgId: string, redis: RedisClient) {
  const clients = await redis.hkeys(`org:${orgId}:clients`)
  for (const client of clients) {
    await dispatchLoadFilingHistoryForCompany(client);
    console.log(new Date(), 'Loaded history for', client);
    await setTimeout(1000) // dispatch one per second
  }
}
