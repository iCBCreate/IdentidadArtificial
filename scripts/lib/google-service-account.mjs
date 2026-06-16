import { existsSync, readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer'
const SCOPE = 'https://www.googleapis.com/auth/webmasters'
const DEFAULT_KEY_PATH = 'secrets/gsc-service-account.json'

export function readEnv(path) {
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

export async function getAccessToken(env = {}) {
  const keyPath = env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || DEFAULT_KEY_PATH
  if (!existsSync(keyPath)) {
    throw new Error(`Service account key not found at ${keyPath}. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH in .dev.vars or place the key there.`)
  }

  const { client_email, private_key } = JSON.parse(readFileSync(keyPath, 'utf8'))
  if (!client_email || !private_key) {
    throw new Error(`Service account key at ${keyPath} is missing client_email or private_key`)
  }

  const jwt = signJwt({ clientEmail: client_email, privateKey: private_key })

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: GRANT_TYPE,
      assertion: jwt,
    }),
  })

  const data = await response.json()
  if (!response.ok || !data.access_token) {
    throw new Error(`Google service account token exchange failed: ${response.status} ${JSON.stringify(data)}`)
  }

  return data.access_token
}

function signJwt({ clientEmail, privateKey }) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(privateKey)
  return `${unsigned}.${base64url(signature)}`
}

function base64url(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buffer.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
