# 第四章：触发机制设计

## 4.1 设计原则

- **用户只说关键字**，其余由 AI 工具自动完成
- **无 Git 依赖**，不与 commit 绑定，內容完全由 AI 生成
- **跨工具通用**，规则文件适配所有支持终端的 AI 工具
- **零安装接入**，规则文件直接内嵌凭证，无需安装 Shell 函数或配置环境变量
- **仅依赖 curl**（Linux/Mac）或 PowerShell（Windows），现代系统均预装

---

## 4.2 触发关键字

| 关键字 | 触发动作 | 类型 |
|--------|---------|------|
| `生成alog日报` | 生成今日工作总结并推送 | `daily` |
| `生成alog博客` | 生成技术产出博客并推送 | `blog` |

---

## 4.3 触发链路详解

```
用户对 AI 说：「生成alog日报」
        ↓
AI 工具读取规则文件（项目级 Hook）
规则文件已内嵌 API Key + Server 地址
        ↓
AI 自动执行：
  1. 回顾本次对话完成的所有任务
  2. 按日报格式组织 Markdown 内容
  3. 从对话上下文提取 2–5 个标签
  4. 在终端直接执行内联 curl 命令：

     # Linux / Mac
     curl -s -X POST https://your-server/api/logs \
       -H "Authorization: Bearer alog_xxx" \
       -H "Content-Type: application/json; charset=utf-8" \
       -d "$(python3 -c "import json,datetime; print(json.dumps({...}))")" 

     # Windows PowerShell
     $b=[System.Text.Encoding]::UTF8.GetBytes((...|ConvertTo-Json -Depth 3))
     Invoke-RestMethod -Method Post -Uri https://your-server/api/logs \
       -Headers @{Authorization="Bearer alog_xxx"} -Body $b

        ↓
终端输出：✅ 日报已发布到 Alog
        ↓
Alog 网站实时展示
```

> 规则文件内嵌了完整的命令（含 API Key 、Server 地址），AI 工具直接执行即可，无需预先安装任何 Shell 函数或配置环境变量。

---

## 4.4 规则文件内嵌凭证模式（推荐）

规则文件内直接将 API Key 和 Server 地址内嵌到命令中，AI 工具直接执行，无需预装任何 Shell 函数或配置环境变量：

```markdown
## 连接配置
- API Key: `alog_your_key`
- Server: `https://your-server.com`
- Source: `cursor`

## 生成alog日报

**Linux / Mac：**
```bash
curl -s -X POST https://your-server.com/api/logs \
  -H "Authorization: Bearer alog_your_key" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json,datetime; print(json.dumps({'type':'daily','title':'日报 — '+str(datetime.date.today()),'content':'<AI生成内容>','source':'cursor','tags':'标签1,标签2'}))")" \
  && echo "✅ 已发布" || echo "❌ 发布失败"
```

**Windows PowerShell：**
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "daily"; title = "日报 — $(Get-Date -Format 'yyyy-MM-dd')"
  content = "<AI生成内容>"; source = "cursor"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "https://your-server.com/api/logs" `
  -Headers @{ Authorization = "Bearer alog_your_key" } `
  -ContentType "application/json; charset=utf-8" -Body $body
```
```

规则文件由 `/setup` 页面自动生成（内嵌真实 Key 和 Server），复制到对应路径即可，**无需其他配置**。

> **可选进阶方案（Shell 函数）**：有开发者偏好将函数注册在 `~/.bashrc` / `$PROFILE` 中，通过 `cat << HEREDOC | 生成alog日报 "tags"` 语法调用。这种方式对 AI 工具更友好（命令更简洁），但需要提前安装函数。详见第八章。

---

## 4.5 AI 工具规则文件（Hook 注入点）

不同 AI 工具读取不同的项目级配置文件，将 Alog 规则注入：

| AI 工具 | 规则文件路径 | 说明 |
|---------|------------|------|
| Cursor | `.cursor/rules/alog.mdc` | Cursor 自动读取 .cursor/rules/ 下所有规则 |
| GitHub Copilot | `.github/copilot-instructions.md` | Copilot 读取项目级指令文件 |
| Claude Code | `.claude/CLAUDE.md` | Claude Code 读取 .claude/CLAUDE.md |
| Windsurf | `.windsurfrc` | Windsurf 全局规则 |
| 通用 | `.alog/rules.md` | 手动粘贴到任意工具的系统提示 |

所有文件**内容相同**，均来自 `rules/` 目录模板。

---

## 4.6 规则文件核心内容

规则文件包含三部分：

1. **触发关键字声明** — 告知 AI 什么时候执行
2. **配置信息** — 内嵌的 API Key、Server URL、Source
3. **完整命令模板** — Linux/Mac 内联 curl + Python3、Windows PowerShell，AI 填入内容后直接运行

```markdown
当用户说「生成alog日报」时：
1. 回顾本次对话完成的所有任务
2. 按规定格式组织内容
3. 自动提取标签（技术栈 + 功能模块，2–5个）
4. 在终端执行推送命令，无需用户确认

当用户说「生成alog博客」时：
1. 将本次对话产出的核心成果提炼为技术博客
2. 按博客格式（背景/方案/代码/总结）组织内容
3. 在终端执行推送命令，无需用户确认
```

---

## 4.7 多工具来源区分

每个 AI 工具配置独立的 API Key， Key 上可设置 `source` 和 `author` 字段：

| API Key | source | author | 用途 |
|---------|--------|--------|------|
| `alog_xxx1` | cursor | 张三 | 张三的 Cursor 接入 |
| `alog_xxx2` | copilot | 李四 | 李四的 Copilot 接入 |
| `alog_xxx3` | copilot | 张三 | 张三的 Copilot 接入 |

同一 source 下也可分不同作者。推送日志时，API Key 上的 `author` 会自动复制到日志记录中。
规则文件由 `/setup` 页面为每个用户单独生成，内嵌对应的 Key 和 Server。
