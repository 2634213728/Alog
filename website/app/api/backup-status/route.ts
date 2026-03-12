import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// GET /api/backup-status — backup metadata (public, read-only)
export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), '..', 'data', 'backup')

    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ count: 0, latestAt: null, latestFile: null })
    }

    const files = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith('alog_') && f.endsWith('.db.gz'))
      .map((f) => ({
        name: f,
        mtime: fs.statSync(path.join(backupDir, f)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    if (files.length === 0) {
      return NextResponse.json({ count: 0, latestAt: null, latestFile: null })
    }

    return NextResponse.json({
      count: files.length,
      latestAt: files[0].mtime.toISOString(),
      latestFile: files[0].name,
    })
  } catch {
    return NextResponse.json({ count: 0, latestAt: null, latestFile: null })
  }
}
