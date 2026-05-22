export function cleanMarkdown(input: string): string {
  return input
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^export\s+const\s+.*$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>\n]+>/g, ' ')
    .split('\n')
    .filter(line => !isTableLine(line))
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function isTableLine(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith('|') && trimmed.endsWith('|')
}
