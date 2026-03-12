import fs from 'fs'
import path from 'path'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export const metadata = {
  title: '更新日志 | Alog',
  description: 'Alog 版本更新历史记录',
}

// 读取 CHANGELOG.md（在 website/ 上一级目录）
function getChangelog(): string {
  const filePath = path.join(process.cwd(), '..', 'CHANGELOG.md')
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return '# Changelog\n\n暂无更新记录。'
  }
}

export default function ChangelogPage() {
  const content = getChangelog()

  const latestMatch = content.match(/##\s+\[([^\]]+)\]/)
  const latestVersion = latestMatch ? latestMatch[1] : null

  return (
    <div className="space-y-8 max-w-3xl pb-12">
      {/* 页头 */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="cyber-section-title text-lg" style={{ fontSize: 18, letterSpacing: 'normal', textTransform: 'none', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            更新日志
          </h1>
          {latestVersion && (
            <span
              className="text-xs font-mono px-2.5 py-1 rounded-full border"
              style={{
                color: 'var(--accent)',
                borderColor: 'rgba(var(--accent-rgb),0.3)',
                background: 'rgba(var(--accent-rgb),0.08)',
              }}
            >
              最新 v{latestVersion}
            </span>
          )}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          记录每个版本的功能新增、修改与修复。
        </p>
        <div className="gradient-divider mt-4" />
      </div>

      {/* Changelog 内容 */}
      <div className="changelog-body">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  )
}
