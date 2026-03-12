import { useCallback, useEffect, useState } from 'react'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthInfo {
  mode: 'server-key' | 'session' | 'none' | 'expired'
  expiresAt: string | null
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [apiKey, setApiKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status')
      const result = (await response.json()) as { data: AuthInfo & { authenticated: boolean } }
      setAuthState(result.data.authenticated ? 'authenticated' : 'unauthenticated')
    } catch {
      setAuthState('unauthenticated')
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!apiKey.trim()) return

      setIsSubmitting(true)
      setErrorMessage('')

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: apiKey.trim() }),
        })

        if (response.ok) {
          const result = (await response.json()) as { data: { token: string } }
          localStorage.setItem('sf_token', result.data.token)
          setAuthState('authenticated')
        } else {
          const result = (await response.json()) as { error: { message: string } }
          setErrorMessage(result.error?.message ?? 'Authentication failed')
        }
      } catch {
        setErrorMessage('Connection failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [apiKey]
  )

  if (authState === 'loading') {
    return (
      <div className="auth-gate">
        <div className="auth-loading">
          <div className="auth-spinner" />
        </div>
      </div>
    )
  }

  if (authState === 'authenticated') {
    return <>{children}</>
  }

  return (
    <div className="auth-gate">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--sf-accent)" fillOpacity="0.15" />
            <path
              d="M8 16L14 22L24 10"
              stroke="var(--sf-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="auth-title">SOLOFOUNDER CANVAS</h1>
        <p className="auth-subtitle">Architecture Diagram Agent</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="api-key" className="auth-label">
              Anthropic API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="auth-input"
              autoComplete="off"
              autoFocus
            />
          </div>

          {errorMessage && <div className="auth-error">{errorMessage}</div>}

          <button type="submit" className="auth-submit" disabled={isSubmitting || !apiKey.trim()}>
            {isSubmitting ? 'Validating...' : 'Connect'}
          </button>
        </form>

        <div className="auth-hint">
          <p>Use your Anthropic API key or Claude Code subscription key.</p>
          <p className="auth-hint-cli">
            CLI: <code>curl -X POST /api/auth/login -d '{`{"apiKey":"sk-ant-..."}`}'</code>
          </p>
        </div>
      </div>
    </div>
  )
}
