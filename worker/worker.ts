import { ExecutionContext } from '@cloudflare/workers-types'
import { WorkerEntrypoint } from 'cloudflare:workers'
import { AutoRouter, cors, error, IRequest } from 'itty-router'
import { Environment } from './environment'
import { authLogin, authLogout, authStatus } from './routes/auth'
import { deepwikiProxy } from './routes/deepwiki'
import { stream } from './routes/stream'

const { preflight, corsify } = cors({ origin: '*' })

const router = AutoRouter<IRequest, [env: Environment, ctx: ExecutionContext]>({
	before: [preflight],
	finally: [corsify],
	catch: (e) => {
		console.error(e)
		return error(e)
	},
})
	.post('/api/auth/login', authLogin)
	.post('/api/auth/logout', authLogout)
	.get('/api/auth/status', authStatus)
	.get('/api/deepwiki/:owner/:repo/structure', deepwikiProxy)
	.post('/api/deepwiki/:owner/:repo/contents', deepwikiProxy)
	.post('/stream', stream)

export default class extends WorkerEntrypoint<Environment> {
	override fetch(request: Request): Promise<Response> {
		return router.fetch(request, this.env, this.ctx)
	}
}

// Make the durable object available to the cloudflare worker
export { AgentDurableObject } from './do/AgentDurableObject'
