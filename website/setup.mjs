#!/usr/bin/env node
// ============================================================
// Alog 初始化脚本 — 创建第一个 API Key
// 用法: node setup.mjs
// ============================================================

import { createInterface } from 'readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-this-admin-token'
const SERVER = process.env.ALOG_SERVER || 'http://localhost:3000'

console.log('\n🚀 Alog 初始化向导\n')
console.log(`服务器地址: ${SERVER}`)
console.log(`管理员 Token: ${ADMIN_TOKEN}\n`)

const name = await ask('API Key 名称（如 Cursor-工作机）: ')
const source = await ask('AI 工具来源（cursor / copilot / claude 等）: ')

rl.close()

try {
  const res = await fetch(`${SERVER}/api/keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ name, source }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  const data = await res.json()
  const key = data.apiKey.key

  console.log('\n✅ API Key 创建成功！\n')
  console.log('请将以下内容添加到你的 Shell 配置文件：\n')
  console.log(`export ALOG_API_KEY="${key}"`)
  console.log(`export ALOG_SOURCE="${source}"`)
  console.log(`export ALOG_SERVER="${SERVER}"\n`)
  console.log('或直接运行客户端安装脚本:')
  console.log('  bash ../client/install.sh\n')
} catch (err) {
  console.error(`\n❌ 失败: ${err.message}`)
  console.error('请确认 Alog 服务已启动（npm run dev 或 npm start）')
}
