import type {FastifyPluginAsync, FastifySchema} from "fastify";
import type { RecentFilings, RecentFilingsItem} from "../../../fs-shared/RecentFilings.js";
import type {FilingHistoryItemResource} from "../../../backend-shared/companiesHouseApi/getFilingHistoryFromApi.js";
import filingDescriptions from '../../../fs-shared/filingDescriptions.json' assert {type:'json'}
import formatString from 'string-template'

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

  function formatFilingDescription(transaction: FilingHistoryItemResource){
    //todo: format dates properly and add currency to end for statement-of-capital
    return formatString(filingDescriptions[transaction.description], transaction.description_values)
  }

  fastify.get<{Querystring: {startDate: string, endDate?: string}, Reply: RecentFilings}>('/', {schema: recentFilingsSchema}, async (request, reply)=>{
    // logic to get recent filings
    const {startDate, endDate} = request.query
    const currentDateDays = Math.floor(new Date().getTime()/86_400_000)
    const startDateDays = Math.floor(new Date(startDate).getTime()/86_400_000)
    const endDateDays = endDate?Math.ceil(new Date(endDate).getTime()/86_400_000):undefined
    request.log.info({startDate, endDate, startDateDaysAgo: currentDateDays - startDateDays, endDateDaysAgo: currentDateDays - (endDateDays??0)},'Recent filings requested for date range')
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
    return recentFilings
  })

}

export default RecentFilingsPlugin
