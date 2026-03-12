import { config } from './config.js'

export interface AlogLog {
  id: string
  type: string
  title: string
  content: string
  source: string
  author: string
  workspace: string
  viewCount: number
  createdAt: string
  tags: Array<{ tag: { id: string; name: string; slug: string } }>
}

export interface AlogListResponse {
  logs: AlogLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AlogTag {
  id: string
  name: string
  slug: string
  count: number
}

export interface AlogAuthor {
  name: string
  slug: string
  source: string
  logCount: number
  dailyCount: number
  blogCount: number
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json; charset=utf-8',
  }
}

// PATCH /api/logs/[id] and DELETE /api/logs/[id] use x-token header instead of Authorization
function tokenHeaders(): Record<string, string> {
  return {
    'x-token': config.apiKey,
    'Content-Type': 'application/json; charset=utf-8',
  }
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${config.serverUrl}${path}`
  const res = await fetch(url, opts)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`ALOG API ${res.status}: ${body || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/**
 * Serialize body to UTF-8 bytes explicitly.
 * Node.js fetch may use the system's default encoding for string bodies on Windows,
 * corrupting multibyte characters (Chinese, Japanese, etc.).
 * Passing a Buffer forces UTF-8 regardless of system locale.
 */
function utf8Body(data: unknown): Buffer {
  return Buffer.from(JSON.stringify(data), 'utf-8')
}

// ── read operations (no auth required) ─────────────────────────────────────

export async function listLogs(params: Record<string, string | number>): Promise<AlogListResponse> {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v))
  }
  return request<AlogListResponse>(`/api/logs?${qs}`)
}

export async function getLog(id: string): Promise<{ log: AlogLog }> {
  return request<{ log: AlogLog }>(`/api/logs/${id}`)
}

export async function getTags(): Promise<{ tags: AlogTag[] }> {
  return request<{ tags: AlogTag[] }>('/api/tags')
}

export async function getAuthors(): Promise<{ authors: AlogAuthor[] }> {
  return request<{ authors: AlogAuthor[] }>('/api/authors')
}

// ── write operations (API key required) ────────────────────────────────────

export async function pushLog(body: {
  type: string
  content: string
  title?: string
  tags?: string
  workspace?: string
  source?: string
}): Promise<{ success: boolean; log: AlogLog }> {
  return request('/api/logs', {
    method: 'POST',
    headers: authHeaders(),
    body: utf8Body({ ...body, source: body.source ?? config.source }),
  })
}

export async function updateLog(
  id: string,
  body: { title?: string; content?: string; tags?: string }
): Promise<{ log: AlogLog }> {
  return request(`/api/logs/${id}`, {
    method: 'PATCH',
    headers: tokenHeaders(),
    body: utf8Body(body),
  })
}

export async function deleteLog(id: string): Promise<{ success: boolean }> {
  return request(`/api/logs/${id}`, {
    method: 'DELETE',
    headers: tokenHeaders(),
  })
}
