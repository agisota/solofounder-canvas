// Session management for solofounder-canvas
// Validates Anthropic API keys and issues session tokens

import { Environment } from '../environment'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface Session {
  token: string
  apiKey: string
  createdAt: number
  expiresAt: number
}

// In-memory session store (per Durable Object instance)
const sessions = new Map<string, Session>()

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function validateAnthropicKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    })
    // 200 = valid key, 401 = invalid key, 429 = rate limited but key is valid
    return response.status === 200 || response.status === 429
  } catch {
    return false
  }
}

export async function createSession(apiKey: string): Promise<string | null> {
  const isValid = await validateAnthropicKey(apiKey)
  if (!isValid) return null

  const token = generateToken()
  const now = Date.now()

  sessions.set(token, {
    token,
    apiKey,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  })

  return token
}

export function getSession(token: string): Session | null {
  const session = sessions.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    sessions.delete(token)
    return null
  }
  return session
}

export function getApiKeyFromSession(token: string): string | null {
  const session = getSession(token)
  return session?.apiKey ?? null
}

export function revokeSession(token: string): boolean {
  return sessions.delete(token)
}

export function extractToken(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check cookie
  const cookies = request.headers.get('Cookie') ?? ''
  const match = cookies.match(/sf_session=([a-f0-9]+)/)
  return match?.[1] ?? null
}

export function authMiddleware(request: Request, env: Environment): string | null {
  // If server has a configured API key, use that (no auth required)
  if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'sk-ant-REPLACE_ME') {
    return env.ANTHROPIC_API_KEY
  }

  // Otherwise, require session token
  const token = extractToken(request)
  if (!token) return null

  return getApiKeyFromSession(token)
}
