import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './App.css'

const healthUrl = '/api/health'

function App() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0()
  const [healthStatus, setHealthStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [healthResponse, setHealthResponse] = useState('')

  const checkHealth = async () => {
    setHealthStatus('loading')
    setHealthResponse('')

    try {
      const response = await fetch(healthUrl)
      const body = await response.text()

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setHealthResponse(body || 'API respondeu sem conteúdo.')
      setHealthStatus('success')
    } catch (error) {
      setHealthResponse(
        error instanceof Error
          ? error.message
          : 'Não foi possível conectar ao backend.',
      )
      setHealthStatus('error')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    let active = true

    fetch(healthUrl)
      .then(async (response) => {
        const body = await response.text()
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        if (active) {
          setHealthResponse(body || 'API respondeu sem conteúdo.')
          setHealthStatus('success')
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setHealthResponse(
            error instanceof Error
              ? error.message
              : 'Não foi possível conectar ao backend.',
          )
          setHealthStatus('error')
        }
      })

    return () => {
      active = false
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <main className="page-shell">Carregando...</main>
  }

  if (!isAuthenticated) {
    return (
      <main className="page-shell">
        <section className="auth-card">
          <div className="brand-mark">PF</div>
          <h1>Bem-vindo</h1>
          <p>Entre para acessar a integração com o backend.</p>
          <button className="primary-button" onClick={() => loginWithRedirect()}>
            Entrar
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">Área protegida</span>
            <h1>Integração</h1>
            <p>Olá, {user?.name ?? 'usuário'}.</p>
          </div>
          <button
            className="secondary-button"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Sair
          </button>
        </header>

        <div className={`health-panel ${healthStatus}`}>
          <div>
            <span className="eyebrow">Teste do backend</span>
            <h2>Health check</h2>
            <p>
              {healthStatus === 'loading'
                ? 'Consultando a API...'
                : healthStatus === 'success'
                  ? 'Backend conectado com sucesso.'
                  : healthStatus === 'error'
                    ? `Falha na conexão: ${healthResponse}`
                    : 'Verifique o status da API.'}
            </p>
            {healthStatus === 'success' && (
              <code className="response">{healthResponse}</code>
            )}
          </div>
          <button
            className="primary-button"
            onClick={() => void checkHealth()}
            disabled={healthStatus === 'loading'}
          >
            {healthStatus === 'loading' ? 'Testando...' : 'Testar novamente'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
