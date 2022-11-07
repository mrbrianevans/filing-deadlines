import type {FastifyPluginAsync, FastifySchema} from "fastify";
import type { RecentFilings, RecentFilingsItem} from "../../../fs-shared/RecentFilings.js";
import { countOccurrances } from "../../../fs-shared/utils/countOccurrances.js";
import type {FilingHistoryItemResource} from "../../../backend-shared/companiesHouseApi/getFilingHistoryFromApi.js";
import { formatFilingDescription } from "../../../backend-shared/companiesHouseApi/formatFilingDescription.js";

const recentFilingsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      startDate: {
        "type": "string",
        format: 'date'
      },
      endDate: {
        "type": "string",
        format: 'date'
      }
    },
    required: ['startDate']
  }
}

const RecentFilingsPlugin: FastifyPluginAsync = async (fastify, opts) => {

  async function getFilingByCompanyNumberTransactionId(companyNumberTransactionId: string): Promise<FilingHistoryItemResource&{companyNumber:string}>{
    const matches = companyNumberTransactionId.match(/^([A-Z\d]{8}):([a-zA-Z\d]{10,})$/)
    if(!matches) throw new Error('Key does not match expected format: "'+companyNumberTransactionId+'". Should be companyNumber:transactionId')
    const [,companyNumber, transactionId] = matches
    const filingString = await fastify.redis.hget(`company:${companyNumber}:filingHistory`, transactionId)
    if(!filingString) fastify.log.error({companyNumber, transactionId, companyNumberTransactionId, filingString}, 'Did not find expected filing transaction')
    const transaction = <FilingHistoryItemResource>JSON.parse(filingString??`{transaction_id:${transactionId}`)
    return Object.assign(transaction, {companyNumber})
  }

  //todo: refactor get recent filings here
  async function getRecentFilings(orgId: string, start: Date, end: Date){
    const startDateDays = Math.floor(start.getTime()/86_400_000)
    const endDateDays = end?Math.ceil(end.getTime()/86_400_000):undefined
    const companyNumberTransactionIds = await fastify.redis.zrange(`org:${orgId}:clientFilings`, startDateDays, endDateDays??'+inf', "BYSCORE")
    // get filing transaction for each ID
    const transactions = await Promise.all(companyNumberTransactionIds.map(c=>getFilingByCompanyNumberTransactionId(c)))
    const companyNames = await Promise.all(transactions.map(t=>fastify.redis.get(`company:${t.companyNumber}:profile`).then(c=>JSON.parse(c??'{}').company_name).then(name=>[t.transaction_id, name]))).then(Object.fromEntries)
    const recentFilings: RecentFilings = []
    for (const transaction of transactions) {
      const {category, subcategory} = transaction
      const companyName = companyNames[transaction.transaction_id]
      const filing: RecentFilingsItem = {
        companyNumber: transaction.companyNumber,
        filingDate: transaction.date,
        transactionId: transaction.transaction_id,
        description: formatFilingDescription(transaction),
        companyName: companyName??'',
        filingType: category,
        subcategory
      }
      recentFilings.push(filing)
    }
  }

  type GetRecentFilingsEndpoint = {Querystring: {startDate: string, endDate?: string}, Reply: { recentFilings: RecentFilings, completeData: boolean, missingCount: number, completeCount: number }}
  fastify.get<GetRecentFilingsEndpoint>('/', {schema: recentFilingsSchema}, async (request, reply)=>{
    // logic to get recent filings
    const {startDate, endDate} = request.query
    const currentDateDays = Math.floor(new Date().getTime()/86_400_000)
    const startDateDays = Math.floor(new Date(startDate).getTime()/86_400_000)
    const endDateDays = endDate?Math.ceil(new Date(endDate).getTime()/86_400_000):undefined
    request.log.info({startDate, endDate, startDateDaysAgo: currentDateDays - startDateDays, endDateDaysAgo: currentDateDays - (endDateDays??0)},'Recent filings requested for date range')
    if(request.org.features.recentFilingsMaxPeriodDays < currentDateDays - startDateDays)
      return reply.wrongPlan(`Your plan only allows viewing ${request.org.features.recentFilingsMaxPeriodDays} days of recent filings.`)
    const clientsWithFilingHistory: boolean[] = await fastify.redis.hkeys(`org:${request.session.orgId}:clients`)
      .then(companyNumbers => Promise.all(companyNumbers.map(c=>fastify.redis.exists(`company:${c}:filingHistory`)))).then(bs=>bs.map(Boolean))
    const completeData = clientsWithFilingHistory.every(b=>b)
    const missingCount = clientsWithFilingHistory.filter(b=>!b).length
    const completeCount = clientsWithFilingHistory.filter(b=>b).length
    if(!completeData) request.log.warn({completeData, clientsCount: clientsWithFilingHistory.length, completeCount,missingCount}, 'Incomplete data for recent filings')
    const companyNumberTransactionIds = await fastify.redis.zrange(`org:${request.session.orgId}:clientFilings`, startDateDays, endDateDays??'+inf', "BYSCORE")
    request.log.info({numberOfTransactions: companyNumberTransactionIds.length},`Found ${companyNumberTransactionIds.length} transaction IDs of recent filings for companies on this org's client list`)
    // get filing transaction for each ID
    const transactions = await Promise.all(companyNumberTransactionIds.map(c=>getFilingByCompanyNumberTransactionId(c)))
    const companyNames = await Promise.all(transactions.map(t=>fastify.redis.get(`company:${t.companyNumber}:profile`).then(c=>JSON.parse(c??'{}').company_name).then(name=>[t.transaction_id, name]))).then(Object.fromEntries)
    const recentFilings: RecentFilings = []
    for (const transaction of transactions) {
      const {category, subcategory} = transaction
      const companyName = companyNames[transaction.transaction_id]
      if(!companyName) request.log.warn({companyName, transactionId: transaction.transaction_id, companyNumber : transaction.companyNumber}, 'Could not find company name for filing transaction')
      const filing: RecentFilingsItem = {
        companyNumber: transaction.companyNumber,
        filingDate: transaction.date,
        transactionId: transaction.transaction_id,
        description: formatFilingDescription(transaction),
        companyName: companyName??'',
        filingType: category,
        subcategory
      }
      recentFilings.push(filing)
    }
    request.log.info(`Returning ${recentFilings.length} recent filings`)
    return {recentFilings, completeData, missingCount, completeCount}
  })

  fastify.get<{Querystring: {startDate: string, endDate?: string}, Reply: Record<string, number>}>('/countByCategory', {schema: recentFilingsSchema}, async (request, reply)=>{
    const {startDate, endDate} = request.query
    const currentDateDays = Math.floor(new Date().getTime()/86_400_000)
    const startDateDays = Math.floor(new Date(startDate).getTime()/86_400_000)
    const endDateDays = endDate?Math.ceil(new Date(endDate).getTime()/86_400_000):undefined
    request.log.info({startDate, endDate, startDateDaysAgo: currentDateDays - startDateDays, endDateDaysAgo: currentDateDays - (endDateDays??0)},'Recent filings counts requested for date range')
    if(request.org.features.recentFilingsMaxPeriodDays < currentDateDays - startDateDays)
      return reply.wrongPlan(`Your plan only allows viewing ${request.org.features.recentFilingsMaxPeriodDays} days of recent filings.`)
    const companyNumberTransactionIds = await fastify.redis.zrange(`org:${request.session.orgId}:clientFilings`, startDateDays, endDateDays??'+inf', "BYSCORE")
    const transactions = await Promise.all(companyNumberTransactionIds.map(c=>getFilingByCompanyNumberTransactionId(c)))
    const categoryOccurrances = transactions.map(t=>t.category)
    const categoryCounts = countOccurrances(categoryOccurrances)
    return categoryCounts
  })

  // get whether or not there is complete data for recent filings, or if there are some still being loaded.
  fastify.get('/completeData', async(request, reply)=>{
    const clientsWithFilingHistory: boolean[] = await fastify.redis.hkeys(`org:${request.session.orgId}:clients`)
      .then(companyNumbers => Promise.all(companyNumbers.map(c=>fastify.redis.exists(`company:${c}:filingHistory`)))).then(bs=>bs.map(Boolean))
    const completeData = clientsWithFilingHistory.every(b=>b)
    const missingCount = clientsWithFilingHistory.filter(b=>!b).length
    const completeCount = clientsWithFilingHistory.filter(b=>b).length
    return {completeData, missingCount, completeCount}
  })

}

export default RecentFilingsPlugin
