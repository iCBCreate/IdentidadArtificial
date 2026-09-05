export const INPUT_DEBOUNCE_MS = 180
export const MAX_RENDERED_TOKENS = 600

export function getTokenRenderLimit(tokens: number[], maxTokens = MAX_RENDERED_TOKENS) {
  return {
    visible: tokens.slice(0, maxTokens),
    hiddenCount: Math.max(0, tokens.length - maxTokens),
  }
}

export function debounce<Args extends unknown[]>(task: (...args: Args) => void, delay: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined

  return (...args: Args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => task(...args), delay)
  }
}
