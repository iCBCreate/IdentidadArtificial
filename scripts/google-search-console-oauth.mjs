import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

const ENV_PATH = '.dev.vars'
const REDIRECT_URI = 'http://127.0.0.1:8787/oauth2callback'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

const env = readEnv(ENV_PATH)
const clientId = env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID
const clientSecret = env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET

if (!clientId || !clientSecret) {
  throw new Error('Missing GOOGLE_SEARCH_CONSOLE_CLIENT_ID or GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET in .dev.vars')
}

const state = randomBytes(16).toString('hex')
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
authUrl.searchParams.set('client_id', clientId)
authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('scope', SCOPE)
authUrl.searchParams.set('access_type', 'offline')
authUrl.searchParams.set('prompt', 'consent')
authUrl.searchParams.set('state', state)

const server = createServer(async (request, response) => {
  let shouldClose = false

  try {
    const url = new URL(request.url ?? '/', REDIRECT_URI)
    if (url.pathname !== '/oauth2callback') {
      response.writeHead(404)
      response.end('Not found')
      return
    }

    if (url.searchParams.get('state') !== state) {
      response.writeHead(400)
      response.end('Invalid OAuth state')
      return
    }

    const code = url.searchParams.get('code')
    if (!code) {
      response.writeHead(400)
      response.end(`OAuth error: ${url.searchParams.get('error') ?? 'missing code'}`)
      return
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok || !tokenData.refresh_token) {
      response.writeHead(500)
      response.end('OAuth completed, but Google did not return a refresh token. Check the terminal.')
      console.error(tokenData)
      return
    }

    env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN = tokenData.refresh_token
    writeEnv(ENV_PATH, env)
    shouldClose = true

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end('<p>Search Console OAuth completado. Ya puedes cerrar esta pestaña.</p>')
    console.log('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN saved in .dev.vars')
  } catch (error) {
    response.writeHead(500)
    response.end('OAuth failed. Check the terminal.')
    console.error(error)
  } finally {
    if (shouldClose) {
      server.close()
    }
  }
})

server.listen(8787, '127.0.0.1', () => {
  console.log('Before opening the URL, make sure this redirect URI is authorized in Google Cloud:')
  console.log(`  ${REDIRECT_URI}`)
  console.log('')
  console.log('Open this URL and authorize Search Console read-only access:')
  console.log(authUrl.href)
})

function readEnv(path) {
  if (!existsSync(path)) return {}

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      })
  )
}

function writeEnv(path, values) {
  const order = [
    'GOOGLE_SEARCH_CONSOLE_CLIENT_ID',
    'GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET',
    'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN',
    'GOOGLE_SEARCH_CONSOLE_SITE_URL',
    'METRICS_ACCESS_TOKEN',
  ]
  const lines = order
    .filter(key => key in values)
    .map(key => `${key}=${values[key]}`)

  writeFileSync(path, `${lines.join('\n')}\n`, { mode: 0o600 })
}
