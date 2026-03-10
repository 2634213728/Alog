# 第六章：数据库结构设计

## 6.1 数据库选型

**SQLite（通过 Prisma 7 + better-sqlite3 适配器）**

| 优势 | 说明 |
|------|------|
| 单文件 | 整个数据库一个 `.db` 文件，备份即拷贝 |
| 零配置 | 无需独立服务进程，随应用启动 |
| 轻量 | 内存占用极低 |
| 可迁移 | Prisma 支持迁移到 PostgreSQL（如需扩展）|

数据库文件位置：`/data/alog.db`（相对于项目根目录的上一级）

---

## 6.2 表结构

### `Log` — 日志主表

```sql
CREATE TABLE Log (
    id          TEXT     PRIMARY KEY,      -- UUID
    type        TEXT     NOT NULL,         -- 'daily' | 'blog'
    title       TEXT     NOT NULL,
    content     TEXT     NOT NULL,         -- Markdown 正文
    source      TEXT     DEFAULT 'unknown',-- AI 工具来源标识
    author      TEXT     DEFAULT '',       -- 作者名称（从关联的 ApiKey.author 自动填入）
    workspace   TEXT     DEFAULT '',       -- 工作区路径（$PWD）
    viewCount   INTEGER  DEFAULT 0,        -- 访问次数（详情页每次加载时自动加 1）
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
    apiKeyId    TEXT     REFERENCES ApiKey(id)
);
```

### `Tag` — 标签表

```sql
CREATE TABLE Tag (
    id    TEXT PRIMARY KEY,  -- UUID
    name  TEXT UNIQUE,       -- 显示名称（如 "TypeScript"）
    slug  TEXT UNIQUE        -- URL 友好格式（如 "typescript"）
);
```

### `LogTag` — 日志标签关联表（多对多）

```sql
CREATE TABLE LogTag (
    logId  TEXT REFERENCES Log(id) ON DELETE CASCADE,
    tagId  TEXT REFERENCES Tag(id) ON DELETE CASCADE,
    PRIMARY KEY (logId, tagId)
);
```

### `ApiKey` — API 密钥表

```sql
CREATE TABLE ApiKey (
    id        TEXT     PRIMARY KEY,  -- UUID
    name      TEXT     NOT NULL,     -- 描述名称（如 "Cursor-工作机"）
    key       TEXT     UNIQUE,       -- alog_ 前缀 + 40 位随机字符
    source    TEXT     NOT NULL,     -- AI 工具标识（cursor/copilot 等）
    author    TEXT     DEFAULT '',   -- 作者名称（如 "张三"）。推送时自动写入 Log.author
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> `author` 是作者的显示名，存放在 `ApiKey` 而不是独立的 Author 表。作者的唯一性通过同名字 Key 共享实现。

---

## 6.3 Prisma Schema

```prisma
model Log {
  id        String   @id @default(uuid())
  type      String
  title     String
  content   String
  source    String   @default("unknown")
  workspace String   @default("")
  createdAt DateTime @default(now())
  apiKeyId  String?
  apiKey    ApiKey?  @relation(fields: [apiKeyId], references: [id])
  tags      LogTag[]
}

model Tag {
  id   String   @id @default(uuid())
  name String   @unique
  slug String   @unique
  logs LogTag[]
}

model LogTag {
  logId String
  tagId String
  log   Log    @relation(fields: [logId], references: [id], onDelete: Cascade)
  tag   Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([logId, tagId])
}

model ApiKey {
  id        String   @id @default(uuid())
  name      String
  key       String   @unique
  source    String
  createdAt DateTime @default(now())
  logs      Log[]
}
```

---

## 6.6 字段设计说明

### 作者字段（`author`）

`author` 存放在 `ApiKey` 表中，推送日志时直接写入 `Log.author`。设计原则：

| 属性 | 说明 |
|------|------|
| 不建独立 `Author` 表 | 作者信息简单，仅是一个名字，无需独立建模 |
| `Log.author` 攜写时直接填入 | 避免关联查询对简单日志查询的影响 |
| Key 更改 `author` 不影响历史日志 | 历史记录保留创建时的作者名 |
| `author` 可为空 | 展示时回车到 source 字段显示 |

### 访问计数字段（`viewCount`）

`viewCount` 存放在 `Log` 表中，详情页每次加载时通过 `POST /api/logs/[id]/view` 自动加一。设计原则：

| 属性 | 说明 |
|------|------|
| 存在主表中 | 无需单独的访问日志表（简单计数，非详细辽诉） |
| 初始化为 0 | 无接口调用前不占存储 |
| MVP 无去重 | 完整去重（按 IP + 时间窗口）属后续优化，先简单累加 |

---

## 6.5 Prisma Schema（目标状态）

```prisma
model Log {
  id        String   @id @default(uuid())
  type      String
  title     String
  content   String
  source    String   @default("unknown")
  author    String   @default("")
  workspace String   @default("")
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
  apiKeyId  String?
  apiKey    ApiKey?  @relation(fields: [apiKeyId], references: [id])
  tags      LogTag[]
}

model ApiKey {
  id        String   @id @default(uuid())
  name      String
  key       String   @unique
  source    String
  author    String   @default("")
  createdAt DateTime @default(now())
  logs      Log[]
}
```

迁移命令：
```bash
npx prisma migrate dev --name add_author_and_viewcount
```

### 首页日志列表（带标签）
```typescript
const logs = await prisma.log.findMany({
  include: { tags: { include: { tag: true } } },
  orderBy: { createdAt: 'desc' },
  take: 50,
})
```

### 按标签筛选
```typescript
const logs = await prisma.log.findMany({
  where: { tags: { some: { tag: { slug: 'typescript' } } } },
  include: { tags: { include: { tag: true } } },
  orderBy: { createdAt: 'desc' },
})
```

### 按作者筛选
```typescript
const logs = await prisma.log.findMany({
  where: { author: '张三' },
  include: { tags: { include: { tag: true } } },
  orderBy: { createdAt: 'desc' },
})
```

### 作者列表（聚合统计）
```typescript
// 利用 groupBy 统计每位作者的日志数
const authorStats = await prisma.log.groupBy({
  by: ['author', 'source'],
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
})
```

### 访问次数加一
```typescript
const updated = await prisma.log.update({
  where: { id },
  data: { viewCount: { increment: 1 } },
  select: { viewCount: true },
})
```

### 标签 Upsert（推送时自动创建新标签）
```typescript
const tag = await prisma.tag.upsert({
  where: { slug },
  update: {},
  create: { name, slug },
})
```

### 标签列表（含文章数）
```typescript
const tags = await prisma.tag.findMany({
  include: { _count: { select: { logs: true } } },
  orderBy: { logs: { _count: 'desc' } },
})
```

### 标签 Upsert（推送时自动创建新标签）
```typescript
const tag = await prisma.tag.upsert({
  where: { slug },
  update: {},
  create: { name, slug },
})
```

---

## 6.7 数据库迁移管理

使用 Prisma Migrate：

```bash
# 开发环境：修改 schema 后执行
npx prisma migrate dev --name <描述>

# 生产环境：部署时执行
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status
```

迁移文件存放于 `prisma/migrations/` 目录，通过 Git 管理。

---

## 6.8 备份策略

SQLite 单文件优势：直接拷贝 `/data/alog.db` 即完成备份。

```bash
# 简单备份脚本
cp /data/alog.db /backup/alog-$(date +%Y%m%d).db

# 定时备份（crontab）
0 2 * * * cp /data/alog.db /backup/alog-$(date +\%Y\%m\%d).db
```
