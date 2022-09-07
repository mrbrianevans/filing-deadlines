
import Fastify from 'fastify'
import HelloWorldPlugin from "./helloWorld.js";

const port = parseInt(process.env.PORT??'4004')

const fastify = Fastify({logger: {level: 'trace'}})

//register any third party plugins here

fastify.register(async (fastify, opts)=>{
  // register endpoints here
  fastify.register(HelloWorldPlugin)
}, {prefix: 'api'})

await fastify.listen({port, host: '::'})


// graceful shutdown
process.on('SIGINT', shutdown) // quit on ctrl-c when running docker in terminal
process.on('SIGTERM', shutdown)// quit properly on docker stop
async function shutdown(sig: string){
  console.info('Graceful shutdown commenced', new Date().toISOString(), sig);
  await fastify.close()
  process.exit()
}
