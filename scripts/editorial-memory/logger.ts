import type { Logger } from './types.ts'

export function createLogger(): Logger {
  return {
    info(event, payload = {}) {
      writeLog('info', event, payload)
    },
    error(event, payload = {}) {
      writeLog('error', event, payload)
    },
  }
}

function writeLog(level: 'info' | 'error', event: string, payload: Record<string, unknown>) {
  process.stdout.write(`${JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  })}\n`)
}
