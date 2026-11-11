const backendHealthUrl = 'http://3.239.255.80:8080/health'
const requestTimeoutMs = 5000

export default async function handler(): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    console.log(`Checking backend health: ${backendHealthUrl}`)
    const response = await fetch(backendHealthUrl, {
      signal: controller.signal,
    })
    const body = await response.text()
    console.log(`Backend health responded with HTTP ${response.status}`)

    return new Response(body, {
      status: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') ?? 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Backend health check failed:', error)
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? 'Timeout ao conectar ao backend.'
        : 'Não foi possível conectar ao backend.'

    return new Response(message, {
      status: 502,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}
