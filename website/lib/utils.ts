export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'alog_'
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

export const SOURCE_COLORS: Record<string, string> = {
  cursor: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10',
  copilot: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
  claude: 'text-orange-400 border-orange-400/40 bg-orange-400/10',
  windsurf: 'text-green-400 border-green-400/40 bg-green-400/10',
  unknown: 'text-slate-400 border-slate-400/40 bg-slate-400/10',
}

export function getSourceColor(source: string): string {
  return SOURCE_COLORS[source.toLowerCase()] ?? SOURCE_COLORS['unknown']
}
