# ============================================================
# Alog PowerShell 函数安装脚本
# 用法: .\install.ps1
# ============================================================

$ProfilePath = $PROFILE.CurrentUserAllHosts

Write-Host "📌 Alog 函数将安装到: $ProfilePath" -ForegroundColor Cyan

$ApiKey = Read-Host "请输入你的 ALOG_API_KEY"
$Source = Read-Host "请输入 ALOG_SOURCE（如 cursor / copilot / claude）"
$Server = Read-Host "请输入 ALOG_SERVER 地址（直接回车使用 http://localhost:3000）"
if ([string]::IsNullOrWhiteSpace($Server)) { $Server = "http://localhost:3000" }

$Functions = @"

# ========== Alog 工作日志函数 ==========
`$env:ALOG_API_KEY = "$ApiKey"
`$env:ALOG_SOURCE  = "$Source"
`$env:ALOG_SERVER  = "$Server"

function 生成alog日报 {
    param([string]`$Tags = "")
    `$content = `$Input | Out-String
    if ([string]::IsNullOrWhiteSpace(`$content)) {
        Write-Host "请通过管道传入内容，例如：" -ForegroundColor Yellow
        Write-Host "  '今日完成...' | 生成alog日报 '标签1,标签2'" -ForegroundColor Yellow
        return
    }
    `$title = "日报 — $(Get-Date -Format 'yyyy-MM-dd')"
    `$body = @{
        type      = "daily"
        title     = `$title
        content   = `$content.Trim()
        source    = `$env:ALOG_SOURCE
        workspace = (Get-Location).Path
        tags      = `$Tags
    } | ConvertTo-Json -Depth 3
    try {
        `$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes(`$body)
        `$resp = Invoke-RestMethod -Method Post -Uri "`$env:ALOG_SERVER/api/logs" ``
            -Headers @{ Authorization = "Bearer `$env:ALOG_API_KEY" } ``
            -ContentType "application/json; charset=utf-8" ``
            -Body `$bodyBytes
        Write-Host "✅ 日报已发布到 Alog" -ForegroundColor Green
    } catch {
        Write-Host "❌ 发布失败: `$_" -ForegroundColor Red
    }
}

function 生成alog博客 {
    param([string]`$Title = "", [string]`$Tags = "")
    `$content = `$Input | Out-String
    if ([string]::IsNullOrWhiteSpace(`$content)) {
        Write-Host "请通过管道传入内容，例如：" -ForegroundColor Yellow
        Write-Host "  '# 标题\n内容' | 生成alog博客 '标题' '标签1,标签2'" -ForegroundColor Yellow
        return
    }
    `$body = @{
        type      = "blog"
        title     = `$Title
        content   = `$content.Trim()
        source    = `$env:ALOG_SOURCE
        workspace = (Get-Location).Path
        tags      = `$Tags
    } | ConvertTo-Json -Depth 3
    try {
        `$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes(`$body)
        `$resp = Invoke-RestMethod -Method Post -Uri "`$env:ALOG_SERVER/api/logs" ``
            -Headers @{ Authorization = "Bearer `$env:ALOG_API_KEY" } ``
            -ContentType "application/json; charset=utf-8" ``
            -Body `$bodyBytes
        Write-Host "✅ 博客已发布到 Alog" -ForegroundColor Green
    } catch {
        Write-Host "❌ 发布失败: `$_" -ForegroundColor Red
    }
}
# ========== End Alog ==========
"@

# 确保 profile 目录存在
$ProfileDir = Split-Path $ProfilePath
if (-not (Test-Path $ProfileDir)) { New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null }

# 追加到 profile
Add-Content -Path $ProfilePath -Value $Functions

Write-Host ""
Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host "   执行以下命令使配置生效：" -ForegroundColor Gray
Write-Host "   . `$PROFILE" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 使用方法：" -ForegroundColor Gray
Write-Host "   '今日内容...' | 生成alog日报 '标签1,标签2'" -ForegroundColor White
Write-Host "   '# 博客内容' | 生成alog博客 '博客标题' '标签1,标签2'" -ForegroundColor White
