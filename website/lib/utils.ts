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

export const SOURCE_COLORS: Record<string, { color: string, background: string, borderColor: string }> = {
  cursor: { color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.1)', borderColor: 'rgba(var(--accent-rgb),0.3)' },
  copilot: { color: 'var(--accent2)', background: 'rgba(var(--accent2-rgb),0.1)', borderColor: 'rgba(var(--accent2-rgb),0.3)' },
  claude: { color: '#f97316', background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.3)' },
  windsurf: { color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  unknown: { color: 'var(--text-muted)', background: 'rgba(100,116,139,0.1)', borderColor: 'rgba(100,116,139,0.3)' },
}

export function getSourceColor(source: string) {
  return SOURCE_COLORS[source.toLowerCase()] ?? SOURCE_COLORS['unknown']
}
