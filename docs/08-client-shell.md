# 第八章：客户端 Shell 函数使用

> ⚡ **新推荐方式（零安装）**：访问 `/setup` 页面，输入 API Key 和 Server 地址，从工具选择器中复制生成的规则文件内容，粘贴到 AI 工具对应路径即可。规则文件内已内嵌完整的 curl 推送命令（Linux/Mac + PowerShell 双版本），AI 工具直接执行，**无需安装任何 Shell 函数或配置环境变量**。
>
> 以下 Shell 函数安装方式**仍然支持**，适合有特殊定制需求、或希望在终端手动触发推送的用户。

## 8.1 安装方式

### Linux / Mac（一键安装脚本）

```bash
bash client/install.sh
```

安装向导会询问：
- `ALOG_API_KEY`：从 Alog 网站/setup.mjs 获取
- `ALOG_SOURCE`：当前 AI 工具标识（cursor / copilot / claude 等）
- `ALOG_SERVER`：Alog 服务器地址（默认 http://localhost:3000）

安装完成后执行：
```bash
source ~/.bashrc   # 或 source ~/.zshrc
```

### Windows PowerShell（一键安装脚本）

```powershell
.\client\install.ps1
```

安装完成后执行：
```powershell
. $PROFILE
```

> ⚠️ **PowerShell 5.1 编码问题**：profile.ps1 必须以 **UTF-8 BOM** 格式保存，否则中文函数名（`生成alog日报`）无法被识别。install.ps1 已自动处理此问题。手动编辑后如遇函数名失效，用以下命令修复：
> ```powershell
> $content = Get-Content $PROFILE -Raw
> [System.IO.File]::WriteAllText($PROFILE, $content, [System.Text.UTF8Encoding]::new($true))
> . $PROFILE
> ```

### 手动安装

将以下内容添加到 `~/.bashrc` 或 `~/.zshrc`：

```bash
# Alog 配置
export ALOG_API_KEY="alog_your_key_here"
export ALOG_SOURCE="cursor"
export ALOG_SERVER="https://your-server.com"

生成alog日报() {
    local content=$(cat -)
    local tags="${1:-}"
    local payload=$(ALOG_TAGS="$tags" printf '%s' "$content" | python3 -c "
import sys, json, os, datetime
content = sys.stdin.read()
print(json.dumps({
    'type': 'daily',
    'title': '日报 — ' + datetime.date.today().isoformat(),
    'content': content,
    'source': os.environ.get('ALOG_SOURCE', 'unknown'),
    'workspace': os.getcwd(),
    'tags': os.environ.get('ALOG_TAGS', '')
}))")
    curl -s -X POST "$ALOG_SERVER/api/logs" \
        -H "Authorization: Bearer $ALOG_API_KEY" \
        -H "Content-Type: application/json; charset=utf-8" \
        --data-binary "$payload" > /dev/null \
        && echo "✅ 日报已发布到 Alog" \
        || echo "❌ 发布失败，请检查 ALOG_API_KEY 和 ALOG_SERVER"
}

生成alog博客() {
    local content=$(cat -)
    local title="${1:-无标题博客}"
    local tags="${2:-}"
    local payload=$(ALOG_TITLE="$title" ALOG_TAGS="$tags" printf '%s' "$content" | python3 -c "
import sys, json, os
content = sys.stdin.read()
print(json.dumps({
    'type': 'blog',
    'title': os.environ.get('ALOG_TITLE', '无标题博客'),
    'content': content,
    'source': os.environ.get('ALOG_SOURCE', 'unknown'),
    'workspace': os.getcwd(),
    'tags': os.environ.get('ALOG_TAGS', '')
}))")
    curl -s -X POST "$ALOG_SERVER/api/logs" \
        -H "Authorization: Bearer $ALOG_API_KEY" \
        -H "Content-Type: application/json; charset=utf-8" \
        --data-binary "$payload" > /dev/null \
        && echo "✅ 博客已发布到 Alog" \
        || echo "❌ 发布失败，请检查 ALOG_API_KEY 和 ALOG_SERVER"
}
```

**依赖：** `curl` + `python3`（现代 Linux/Mac 均默认自带）

> 使用 python3 替代 jq 构建 JSON 的原因：python3 原生支持 Unicode，可正确处理中文内容；而 jq 在部分环境下对非 ASCII 字符转义存在兼容性问题。

---

## 8.2 日常使用

### 发布日报

用户对 AI 说：**「生成alog日报」**

AI 在终端执行（用户无需操作）：
```bash
cat << 'ALOG_EOF' | 生成alog日报 "TypeScript,Auth,性能优化"
## 今日完成任务
- 实现 JWT 用户登录模块，包含 token 生成和验证
- 修复首页按钮样式在移动端的对齐问题
- 优化用户列表接口响应速度，从 800ms 降至 120ms

## 技术要点
- JWT accessToken 15 分钟 + refreshToken 7 天双 Token 策略
- CSS Grid 替代 Flexbox 解决移动端对齐问题

## 遇到的问题与解决
- JWT 过期需与前端 axios 拦截器协调，改用统一刷新逻辑

## 明日计划
- 实现刷新 token 逻辑
- 开始权限模块开发
ALOG_EOF
```

终端输出：`✅ 日报已发布到 Alog`

---

### 发布博客

用户对 AI 说：**「生成alog博客」**

AI 在终端执行：
```bash
cat << 'ALOG_EOF' | 生成alog博客 "JWT 双 Token 认证实现" "TypeScript,Auth,JWT,安全"
## 背景与目标
项目需要一套安全的 JWT 认证流程，支持 token 刷新，避免频繁登录。

## 实现方案
使用 jsonwebtoken 库实现双 Token 策略：
- accessToken：15 分钟有效，用于 API 鉴权
- refreshToken：7 天有效，仅用于刷新 accessToken

## 关键实现

```typescript
// 生成 token
const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' })
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })
```

## 总结
约 150 行代码实现完整认证，前后端通过 axios 拦截器自动处理刷新逻辑，用户无感知。
ALOG_EOF
```

---

## 8.3 PowerShell 中文编码说明

PowerShell 推送中文内容时需特殊处理，否则服务器收到的是乱码（`??`）：

```powershell
# ❌ 错误写法：默认编码，中文会变乱码
Invoke-RestMethod -Body $jsonString -ContentType "application/json"

# ✅ 正确写法：手动转 UTF-8 字节数组
$bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
Invoke-RestMethod -Body $bytes -ContentType "application/json; charset=utf-8"
```

**根因**：PowerShell 5.1 的 `Invoke-RestMethod` 默认使用 Windows-1252 编码处理字符串 body；改用 `byte[]` 后，编码由应用层完全控制。

---

## 8.4 获取 API Key

通过以下任一方式获取 API Key：

**方式一：网站接入页面（推荐）**

访问 `http://your-server:3000/setup`，在 Step 1 输入 Admin Token，即可查看所有已有 Key 或创建新 Key。

**方式二：curl 命令**
```bash
# 列出所有 Key
curl http://your-server:3000/api/keys \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"

# 创建新 Key
curl -X POST http://your-server:3000/api/keys \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Cursor Key", "source": "cursor"}'
```

---

## 8.5 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `ALOG_API_KEY` | ✅ | 从 Alog 网站 /setup 页或 API 创建的 API Key |
| `ALOG_SOURCE` | ✅ | 当前 AI 工具标识（cursor/copilot/claude 等）|
| `ALOG_SERVER` | ✅ | Alog 服务器地址（含协议和端口）|

---

## 8.6 多工具配置

如果同时使用多个 AI 工具，推荐在不同终端 Profile 中配置不同的 `ALOG_SOURCE` 和 `ALOG_API_KEY`：

**方案 A：不同 Shell Profile**
```bash
# ~/.bashrc（Cursor 专用）
export ALOG_SOURCE="cursor"
export ALOG_API_KEY="alog_cursor_xxx"
```

**方案 B：项目级 `.env` 覆盖（不推荐，有泄露风险）**

**方案 C：AI 工具识别（推荐）**  
在 AI 工具规则文件中指定 `ALOG_SOURCE` 的值，确保推送时自动标注来源。

---

## 8.7 故障排查

| 现象 | 排查 |
|------|------|
| `❌ 发布失败 (HTTP 401)` | 检查 `$ALOG_API_KEY` 是否正确设置 |
| `❌ 发布失败 (HTTP 400)` | 检查推送内容是否为空 |
| `curl: command not found` | 安装 curl：`apt install curl` |
| `python3: command not found` | 安装 python3：`apt install python3` |
| 函数不存在 | 执行 `source ~/.bashrc` 重新加载 Shell |
| 页面/数据库出现 `??` 乱码 | PowerShell 推送时未使用 UTF-8 编码，参见 8.3 节 |
| PowerShell 中文函数名失效 | profile.ps1 需以 UTF-8 BOM 格式保存，参见 8.1 节 |
