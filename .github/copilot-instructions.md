````instructions
# Alog 工作日志规则

## 触发关键字

当用户说以下关键字时，必须立即执行对应操作，**无需确认**：

- `生成alog日报`  生成工作日报并推送
- `生成alog博客`  生成技术博客并推送

---

## 连接配置
- API Key: `YOUR_COPILOT_API_KEY`
- Server: `http://localhost:3000`
- Source: `copilot`

---

## 生成alog日报

回顾本次对话完成的所有工作，在终端执行：

**Windows PowerShell：**
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "daily"; title = "日报  $(Get-Date -Format 'yyyy-MM-dd')"
  content = "<AI生成的日报内容>"; source = "copilot"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/logs" `
  -Headers @{ Authorization = "Bearer YOUR_COPILOT_API_KEY" } `
  -ContentType "application/json; charset=utf-8" -Body $body
```

标签规则：从对话提取技术栈名 + 功能模块名，2-5 个。

---

## 生成alog博客

提炼本次技术成果，在终端执行：

**Windows PowerShell：**
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes((@{
  type = "blog"; title = "<简洁的博客标题>"
  content = "<AI生成的博客内容>"; source = "copilot"; tags = "标签1,标签2"
} | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/logs" `
  -Headers @{ Authorization = "Bearer YOUR_COPILOT_API_KEY" } `
  -ContentType "application/json; charset=utf-8" -Body $body
```

---

**执行后**：检查终端 `✅` 表示成功，`❌` 表示需检查 API Key 和 Server 地址。
直接执行命令，不要向用户寻求确认。

````