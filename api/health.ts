const backendHealthUrl = 'http://3.239.255.80:8080/health'

export default async function handler(): Promise<Response> {
  try {
    const response = await fetch(backendHealthUrl)
    const body = await response.text()

    return new Response(body, {
      status: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') ?? 'text/plain; charset=utf-8',
      },
    })
  } catch {
    return new Response('Não foi possível conectar ao backend.', {
      status: 502,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    })
  }
}
