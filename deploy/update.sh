#!/usr/bin/env bash
# ============================================================
# Alog 服务器端热更新脚本（由 GitHub Actions 远程调用）
# 适用于: Ubuntu 22.04 / PM2 管理的 Next.js 项目
# 前置条件: 首次部署已通过 deploy.sh 完成
# ============================================================
set -e

DEPLOY_DIR="/opt/alog"
WEBSITE_DIR="$DEPLOY_DIR/website"
LOG_DIR="/var/log/alog"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "=========================================="
echo "  Alog 更新脚本 - $TIMESTAMP"
echo "=========================================="

# ---------- 1. 拉取最新代码 ----------
echo ""
echo "▶ [1/5] 拉取最新代码..."
cd "$DEPLOY_DIR"
git pull origin master
echo "✅ 代码更新完成"

# ---------- 2. 安装/更新依赖 ----------
echo ""
echo "▶ [2/5] 安装依赖..."
cd "$WEBSITE_DIR"
# 使用 npm ci 保证与 package-lock.json 一致
npm ci --production=false
echo "✅ 依赖安装完成"

# ---------- 3. 构建项目 ----------
echo ""
echo "▶ [3/5] 构建 Next.js 项目..."
npm run build
echo "✅ 构建完成"

# ---------- 4. 数据库迁移 ----------
echo ""
echo "▶ [4/5] 执行数据库迁移..."
npx prisma migrate deploy
echo "✅ 数据库迁移完成"

# ---------- 5. 重载 PM2（零停机） ----------
echo ""
echo "▶ [5/5] 重载 PM2 进程..."
# reload 会进行滚动重启，实现零停机
# 若进程不存在则使用 start
if pm2 describe alog > /dev/null 2>&1; then
  pm2 reload alog --update-env
else
  echo "⚠️  PM2 进程 alog 不存在，尝试启动..."
  cd "$DEPLOY_DIR"
  pm2 start ecosystem.config.cjs
  pm2 save
fi
echo "✅ PM2 重载完成"

# ---------- 完成摘要 ----------
echo ""
echo "=========================================="
echo "  ✅ 部署成功！"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  提交: $(git -C "$DEPLOY_DIR" rev-parse --short HEAD)"
echo "=========================================="
echo ""
echo "📊 当前 PM2 状态:"
pm2 list
