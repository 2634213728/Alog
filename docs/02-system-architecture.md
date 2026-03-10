# 第二章：系统架构设计

## 2.1 整体架构

```
本地开发机器（任意 OS）
│
├── 环境变量
│   ├── ALOG_SOURCE=cursor          当前 AI 工具标识
│   └── ALOG_API_KEY=alog_xxx       认证密钥
│
└── Shell 函数（.bashrc / .zshrc / PowerShell Profile）
    ├── 生成alog日报  ──────────────────────────┐
    └── 生成alog博客  ──────────────────────────┤
                                               │ curl / Invoke-RestMethod
                                               ↓
                              ┌────────────────────────────────┐
                              │         Linux 服务器            │
                              │                                │
                              │  Nginx（80/443 反向代理）       │
                              │       ↓                        │
                              │  Next.js 应用（PM2 守护）       │
                              │  ├── POST /api/logs  接收推送  │
                              │  ├── GET  /          首页列表  │
                              │  ├── GET  /daily     日报列表  │
                              │  ├── GET  /blog      博客列表  │
                              │  ├── GET  /tags      标签索引  │
                              │  └── GET  /[type]/[id] 详情页  │
                              │       ↓                        │
                              │  SQLite 数据库（单文件）         │
                              │  /data/alog.db                 │
                              └────────────────────────────────┘
```

---

## 2.2 技术栈选型

| 层级 | 技术 | 选型理由 |
|------|------|---------|
| **全栈框架** | Next.js 15 (App Router) | 前后端一体，API Routes 天然支持，部署灵活 |
| **数据库** | SQLite | 单文件，零配置，备份即拷贝，轻量运行 |
| **ORM** | Prisma 7 | 类型安全，Schema 迁移管理完善 |
| **SQLite 驱动** | better-sqlite3 | Prisma 7 推荐的本地 SQLite 适配器 |
| **样式** | Tailwind CSS | 快速构建，主题定制能力强 |
| **Markdown 渲染** | react-markdown + rehype-highlight | 代码语法高亮，安全渲染 |
| **进程守护** | PM2 | 崩溃自动重启，日志管理 |
| **反向代理** | Nginx | 80/443 端口转发，SSL 终止 |
| **客户端** | curl + Shell 函数 | 零安装，跨平台 |

---

## 2.3 数据流向

### 写入流程
```
AI 工具终端
    │
    │ cat << 'EOF' | 生成alog日报 "标签1,标签2"
    │ ...内容...
    │ EOF
    ↓
Shell 函数：读取 stdin + 环境变量
    │
    │ curl -X POST /api/logs
    │ Authorization: Bearer $ALOG_API_KEY
    │ Content-Type: application/json
    ↓
Next.js API Route: POST /api/logs
    │ 验证 API Key
    │ 解析 tags（逗号分隔 → 数组）
    │ Upsert 标签（Tag 表）
    │ 创建日志（Log 表）
    │ 关联标签（LogTag 表）
    ↓
SQLite 数据库持久化
```

### 读取流程
```
浏览器访问 https://your-server/
    ↓
Next.js 服务端渲染
    │ Prisma 查询 Log + Tag
    ↓
HTML 页面（深色主题 UI）
```

---

## 2.4 组件结构

```
website/
├── app/                          页面路由（App Router）
│   ├── page.tsx                  首页：全部日志列表
│   ├── daily/page.tsx            日报列表
│   ├── blog/page.tsx             博客列表
│   ├── tags/page.tsx             标签总览
│   ├── tags/[slug]/page.tsx      按标签筛选列表
│   ├── [type]/[id]/page.tsx      日志详情页
│   ├── api/logs/route.ts         API: 日志 CRUD
│   ├── api/tags/route.ts         API: 标签列表
│   ├── api/keys/route.ts         API: Key 管理
│   ├── layout.tsx                全局布局
│   └── globals.css               全局样式 + 主题变量
│
├── components/
│   ├── Header.tsx                顶部导航（Client）
│   ├── LogCard.tsx               日志卡片（Client，处理点击导航）
│   ├── TagBadge.tsx              标签徽章组件
│   └── MarkdownRenderer.tsx      Markdown 渲染（Client，含语法高亮）
│
└── lib/
    ├── prisma.ts                 Prisma Client 单例
    └── utils.ts                  工具函数（日期格式化、颜色映射等）
```

---

## 2.5 部署拓扑

```
Internet
    ↓
Nginx :80/:443
    ↓ proxy_pass
Next.js :3000 (PM2)
    ↓
SQLite /data/alog.db
```

**资源占用估算（生产环境）：**
- 内存：~80–120MB（Next.js 进程）
- 磁盘：< 50MB（应用） + 数据库文件大小
- CPU：极低（SSR 页面，数据量小）
