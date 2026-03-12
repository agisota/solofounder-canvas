import { IRequest } from 'itty-router'

const DEEPWIKI_BASE_URL = 'https://api.deepwiki.com'

/**
 * Proxy route for DeepWiki API calls.
 * Supports:
 *   GET  /api/deepwiki/:owner/:repo/structure — fetch wiki structure
 *   POST /api/deepwiki/:owner/:repo/contents  — fetch wiki contents for specific sections
 */
export async function deepwikiProxy(request: IRequest) {
	const { owner, repo } = request.params

	if (!owner || !repo) {
		return new Response(JSON.stringify({ error: 'Missing owner or repo parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const repoFullName = `${owner}/${repo}`
	const url = new URL(request.url)
	const pathSuffix = url.pathname.replace(`/api/deepwiki/${owner}/${repo}`, '')

	let deepwikiUrl: string
	let fetchOptions: RequestInit

	if (pathSuffix === '/structure') {
		// GET wiki structure
		deepwikiUrl = `${DEEPWIKI_BASE_URL}/wiki/structure/${repoFullName}`
		fetchOptions = {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		}
	} else if (pathSuffix === '/contents') {
		// POST wiki contents — forward the request body
		deepwikiUrl = `${DEEPWIKI_BASE_URL}/wiki/contents/${repoFullName}`
		const body = await request.text()
		fetchOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body,
		}
	} else {
		return new Response(JSON.stringify({ error: 'Unknown deepwiki endpoint' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	try {
		const response = await fetch(deepwikiUrl, fetchOptions)
		const data = await response.text()

		return new Response(data, {
			status: response.status,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		})
	} catch (err) {
		console.error('DeepWiki proxy error:', err)
		return new Response(
			JSON.stringify({ error: 'Failed to fetch from DeepWiki', details: String(err) }),
			{
				status: 502,
				headers: { 'Content-Type': 'application/json' },
			}
		)
	}
}
