import type {FastifyPluginAsync, FastifySchema} from "fastify";
import type {Feedback, StoredFeedback} from '../../fs-shared/Feedback.js'
import {FeedbackStatus} from "../../fs-shared/Feedback.js";
import {randomUUID} from "crypto";

const newFeatureRequestSchema: FastifySchema = {
   body: {
     type: 'object',
     properties: {
       title: {
         type: 'string'
       },
       description: {
         type: 'string'
       },
       feedbackType: {
         type: 'string',
         enum: ['feature-request','enhancement','comment',"problem"]
       }
     }
   }
}

const FeedbackPlugin: FastifyPluginAsync = async (fastify, opts) => {

  fastify.post<{Body: Feedback}>('/', {schema: newFeatureRequestSchema},async (request, reply)=>{
    const feedback = request.body
    request.log.info(feedback, 'Feedback received')
    const feedbackId = randomUUID()
    const storedFeedback: StoredFeedback = {...feedback, userId: request.session.userId, status: FeedbackStatus.UNREVIEWED, requestedAt: new Date().toISOString()}
    await fastify.redis.hset(`feedback:${feedbackId}`, storedFeedback)
    return {feedbackId}
  })

}

export default FeedbackPlugin
