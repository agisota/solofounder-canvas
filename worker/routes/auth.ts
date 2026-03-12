import { IRequest } from 'itty-router'
import { Environment } from '../environment'
import { createSession, revokeSession, extractToken, getSession } from '../auth/session'

export async function authLogin(request: IRequest, env: Environment) {
  try {
    const body = (await request.json()) as { apiKey?: string }
    const apiKey = body?.apiKey

    if (!apiKey || typeof apiKey !== 'string') {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_KEY', message: 'API key is required' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const token = await createSession(apiKey)
    if (!token) {
      return new Response(
        JSON.stringify({
          error: { code: 'INVALID_KEY', message: 'Invalid Anthropic API key' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ data: { token, expiresIn: 86400 } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `sf_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL', message: 'Authentication failed' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function authLogout(request: IRequest) {
  const token = extractToken(request as unknown as Request)
  if (token) {
    revokeSession(token)
  }
  return new Response(JSON.stringify({ data: { success: true } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'sf_session=; Path=/; Max-Age=0',
    },
  })
}

export async function authStatus(request: IRequest, env: Environment) {
  // If server has configured API key, always authenticated
  if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'sk-ant-REPLACE_ME') {
    return new Response(
      JSON.stringify({
        data: { authenticated: true, mode: 'server-key', expiresAt: null },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const token = extractToken(request as unknown as Request)
  if (!token) {
    return new Response(
      JSON.stringify({ data: { authenticated: false, mode: 'none' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const session = getSession(token)
  if (!session) {
    return new Response(
      JSON.stringify({ data: { authenticated: false, mode: 'expired' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      data: {
        authenticated: true,
        mode: 'session',
        expiresAt: new Date(session.expiresAt).toISOString(),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
