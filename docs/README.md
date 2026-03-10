# Alog 设计文档索引

**Alog** — AI 编程工具任务日志聚合平台

---

## 文档章节

| 章节 | 文件 | 说明 |
|------|------|------|
| 第一章 | [01-product-overview.md](01-product-overview.md) | 产品定位与核心需求 |
| 第二章 | [02-system-architecture.md](02-system-architecture.md) | 系统架构设计 |
| 第三章 | [03-content-types.md](03-content-types.md) | 内容类型：日报与博客 |
| 第四章 | [04-trigger-mechanism.md](04-trigger-mechanism.md) | 触发机制：关键字 + Shell Hook |
| 第五章 | [05-api-design.md](05-api-design.md) | API 接口设计 |
| 第六章 | [06-database-schema.md](06-database-schema.md) | 数据库结构设计 |
| 第七章 | [07-frontend-design.md](07-frontend-design.md) | 前端 UI 风格设计 |
| 第八章 | [08-client-shell.md](08-client-shell.md) | 客户端 Shell 函数使用 |
| 第九章 | [09-ai-tool-rules.md](09-ai-tool-rules.md) | AI 工具规则文件（Hook 注入） |
| 第十章 | [10-deployment.md](10-deployment.md) | Linux 服务器部署指南 |

---

## 快速上手

```bash
# 1. 启动本地开发服务器
cd website && npm run dev

# 2. 创建第一个 API Key
node website/setup.mjs

# 3. 安装 Shell 函数（Linux/Mac）
bash client/install.sh

# 4. 安装 Shell 函数（Windows）
.\client\install.ps1

# 5. 使用（对 AI 说）
生成alog日报
生成alog博客
```

---

*最后更新: 2026-03-10*
