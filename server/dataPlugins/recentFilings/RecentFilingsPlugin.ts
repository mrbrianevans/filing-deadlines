import type {FastifyPluginAsync, FastifySchema} from "fastify";
import type {RecentFilings, RecentFilingsItem} from "../../../fs-shared/RecentFilings.js";
import type {FilingHistoryItemResource} from "../../../backend-shared/companiesHouseApi/getFilingHistoryFromApi.js";

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

  fastify.get<{Querystring: {startDate: string, endDate?: string}, Reply: RecentFilings}>('/', {schema: recentFilingsSchema}, async (request, reply)=>{
    // logic to get recent filings
    const {startDate, endDate} = request.query
    const startDateDays = Math.floor(new Date(startDate).getTime()/86_400_000)
    const endDateDays = Math.ceil(new Date(endDate??Date.now()).getTime()/86_400_000) // could also be '+inf' to be all higher than start date
    request.log.debug({startDateDays, endDateDays},['Executing', 'ZRANGE', `org:${request.session.orgId}:clientFilings`, startDateDays, endDateDays].join(' '))
    const companyNumberTransactionIds = await fastify.redis.zrange(`org:${request.session.orgId}:clientFilings`, startDateDays, endDateDays)
    request.log.debug({companyNumberTransactionIds},"GOT "+ companyNumberTransactionIds+ ' ids')
    // get filing transaction for each ID
    const transactions = await Promise.all(companyNumberTransactionIds.map(c=>getFilingByCompanyNumberTransactionId(c)))
    const recentFilings: RecentFilings = {}
    for (const transaction of transactions) {
      const {category} = transaction
      request.log.debug({category},'Found transaction with category ' + category)
      const companyName = await fastify.redis.get(`company:${transaction.companyNumber}:profile`).then(c=>JSON.parse(c??'{}').company_name)
      const filing: RecentFilingsItem = {
        companyNumber: transaction.companyNumber,
        filingDate: transaction.date,
        transactionId: transaction.transaction_id,
        description: transaction.description,
        companyName: companyName??''
      }
      if(category in recentFilings) recentFilings[category].push(filing)
      else recentFilings[category] = [filing]
    }
    return recentFilings
  })

}

export default RecentFilingsPlugin
