# 第九章：AI 工具规则文件

## 9.1 概述

**规则文件**是 Alog 实现"用户只说关键字、AI 自动完成推送"的核心机制。

各大 AI 工具都支持**项目级规则/指令文件**，在项目打开时自动读取，相当于预置的系统提示。将 Alog 规则写入这些文件，即可让 AI 工具"理解" `生成alog日报` 和 `生成alog博客` 的含义，并自动执行推送命令。

---

## 9.2 各工具规则文件位置

| AI 工具 | 文件路径 | 自动读取 |
|---------|---------|---------|
| **Cursor** | `.cursor/rules/alog.mdc` | ✅ 自动 |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ 自动 |
| **Claude Code** | `.claude/CLAUDE.md` | ✅ 自动 |
| **Windsurf** | `.windsurfrc` | ✅ 自动 |
| **其他** | `.alog/rules.md` | 手动粘贴到系统提示 |

> 所有文件**内容相同**，均可从 `rules/` 目录获取对应模板。

---

## 9.3 Cursor 规则文件（`.cursor/rules/alog.mdc`）

> 💡 推荐直接在 `/setup` 页面生成此文件内容（自动内嵌真实 API Key 和 Server 地址），以下为结构示例（`YOUR_API_KEY` / `YOUR_SERVER` 需替换为实际值）。

```markdown
---
description: Alog 工作日志自动推送规则
globs: ["**/*"]
alwaysApply: true
---

# Alog 工作日志规则

## 触发关键字

当用户说以下关键字时，必须立即执行对应操作，**无需确认**：

- `生成alog日报` → 生成工作日报并推送
- `生成alog博客` → 生成技术博客并推送

---

## 连接配置
- API Key: `YOUR_API_KEY`
- Server: `YOUR_SERVER`
- Source: `cursor`

---

## 生成alog日报

回顾本次对话完成的所有工作，在终端执行（选择适合当前系统的命令）：

**Linux / Mac：**
​```bash
curl -s -X POST YOUR_SERVER/api/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json,datetime; print(json.dumps({'type':'daily','title':'日报 — '+str(datetime.date.today()),'content':'[AI生成的日报内容]','source':'cursor','tags':'标签1,标签2'}))")" \
  && echo "✅ 已发布" || echo "❌ 发布失败，请检查 API Key 和 Server 地址"
​```

**Windows PowerShell：**
​```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "daily"; title = "日报 — $(Get-Date -Format 'yyyy-MM-dd')"
  content = "[AI生成的日报内容]"; source = "cursor"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "YOUR_SERVER/api/logs" `
  -Headers @{ Authorization = "Bearer YOUR_API_KEY" } `
  -ContentType "application/json; charset=utf-8" -Body $body
​```

标签规则：从对话提取技术栈名 + 功能模块名，2-5 个。

---

## 生成alog博客

提炼本次技术成果，在终端执行：

**Linux / Mac：**
​```bash
curl -s -X POST YOUR_SERVER/api/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json; print(json.dumps({'type':'blog','title':'[简洁的博客标题]','content':'[AI生成的博客内容]','source':'cursor','tags':'标签1,标签2'}))")" \
  && echo "✅ 已发布" || echo "❌ 发布失败"
​```

**Windows PowerShell：**
​```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "blog"; title = "[简洁的博客标题]"
  content = "[AI生成的博客内容]"; source = "cursor"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "YOUR_SERVER/api/logs" `
  -Headers @{ Authorization = "Bearer YOUR_API_KEY" } `
  -ContentType "application/json; charset=utf-8" -Body $body
​```

**执行后**：检查终端 `✅` 表示成功，`❌` 表示需检查 API Key 和 Server 地址。
直接执行命令，不要向用户寻求确认。
```

---

## 9.4 GitHub Copilot 规则文件（`.github/copilot-instructions.md`）

> 💡 推荐直接在 `/setup` 页面选择「Copilot」Tab，复制生成的内容（已内嵌真实凭证）直接粘贴到文件末尾。

创建或在文件末尾追加以下内容（`YOUR_API_KEY` / `YOUR_SERVER` 需替换为实际值）：

```markdown
## Alog 工作日志规则

## 触发关键字

当用户说以下关键字时，必须立即执行对应操作，**无需确认**：

- `生成alog日报` → 生成工作日报并推送
- `生成alog博客` → 生成技术博客并推送

---

## 连接配置
- API Key: `YOUR_API_KEY`
- Server: `YOUR_SERVER`
- Source: `copilot`

---

## 生成alog日报

回顾本次对话完成的所有工作，在终端执行：

**Linux / Mac：**
```bash
curl -s -X POST YOUR_SERVER/api/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json,datetime; print(json.dumps({'type':'daily','title':'日报 — '+str(datetime.date.today()),'content':'[AI生成的日报内容]','source':'copilot','tags':'标签1,标签2'}))")" \
  && echo "✅ 已发布" || echo "❌ 发布失败"
```

**Windows PowerShell：**
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "daily"; title = "日报 — $(Get-Date -Format 'yyyy-MM-dd')"
  content = "[AI生成的日报内容]"; source = "copilot"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "YOUR_SERVER/api/logs" `
  -Headers @{ Authorization = "Bearer YOUR_API_KEY" } `
  -ContentType "application/json; charset=utf-8" -Body $body
```

标签规则：从对话提取技术栈名 + 功能模块名，2-5 个。

---

## 生成alog博客

提炼本次技术成果，在终端执行：

**Linux / Mac：**
```bash
curl -s -X POST YOUR_SERVER/api/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json; print(json.dumps({'type':'blog','title':'[简洁的博客标题]','content':'[AI生成的博客内容]','source':'copilot','tags':'标签1,标签2'}))")" \
  && echo "✅ 已发布" || echo "❌ 发布失败"
```

**Windows PowerShell：**
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "blog"; title = "[简洁的博客标题]"
  content = "[AI生成的博客内容]"; source = "copilot"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "YOUR_SERVER/api/logs" `
  -Headers @{ Authorization = "Bearer YOUR_API_KEY" } `
  -ContentType "application/json; charset=utf-8" -Body $body
```

**执行后**：检查终端 `✅` 表示成功，`❌` 表示需检查 API Key 和 Server 地址。
直接执行命令，不要向用户寻求确认。
```

---

## 9.5 在新项目中启用 Alog

**推荐方式（零安装）：**

1. 访问 Alog 网站 `/setup` 接入页面
2. Step 1：填写 API Key、Server URL、Source
3. Step 2：选择对应 AI 工具 Tab → 点击「📋 复制规则内容」
4. 将复制内容粘贴到项目对应文件路径

规则内容已内嵌真实凭证和完整 curl 命令，无需额外配置。

**手动方式（使用模板）：**

```bash
# Cursor
mkdir -p .cursor/rules
cp /path/to/alog/rules/alog.mdc .cursor/rules/

# GitHub Copilot（创建独立文件，或追加到已有文件末尾）
mkdir -p .github
cp /path/to/alog/rules/copilot-instructions.md .github/copilot-instructions.md

# Claude Code
mkdir -p .claude
cp /path/to/alog/rules/copilot-instructions.md .claude/CLAUDE.md
```

> 注意：手动复制模板文件后，需要将其中的 `YOUR_API_KEY` 和 `YOUR_SERVER` 替换为实际值。推荐直接使用 `/setup` 页面生成的版本（已自动替换）。

---

## 9.6 规则文件维护

**主要来源：`/setup` 页面（推荐）**

访问 `/setup` 页面选择对应工具 Tab，系统根据你填写的 API Key 和 Server 地址**动态生成**规则内容（含内嵌凭证），一键复制即可更新到项目。

**备用来源：项目 `rules/` 目录模板（遗留）**

```
rules/
└── copilot-instructions.md  通用规则模板（Copilot / Claude / Windsurf 格式相同）
```

模板中使用 `YOUR_API_KEY` / `YOUR_SERVER` 占位符，需手动替换后使用。

当规则逻辑需要更新（如新增触发词或修改推送命令格式）时，修改 `rules/copilot-instructions.md` 后重新复制到各项目对应路径；或在 `/setup` 页面重新复制生成的最新版本。

---

## 9.7 规则生效验证

打开 AI 工具，对话中说：

> 「生成alog日报」

如果 AI 直接在终端执行推送命令（而非询问你要做什么），说明规则已生效。

如果 AI 没有自动行动，检查：
1. 规则文件是否在正确路径
2. AI 工具是否重新加载了项目（重启 IDE）
3. 规则文件内容是否完整
