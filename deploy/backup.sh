#!/usr/bin/env bash
# ============================================================
# Alog SQLite 定期备份脚本
# 备份频率: 每 2 天（由 crontab 控制: 0 3 */2 * * backup.sh）
# 保留策略: 60 天
# 备份目录: /home/alog/alog/data/backup/
# ============================================================
set -e

DEPLOY_DIR="/home/alog/alog"
DB_FILE="$DEPLOY_DIR/data/alog.db"
BACKUP_DIR="$DEPLOY_DIR/data/backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/alog_${TIMESTAMP}.db"
RETAIN_DAYS=60

# 创建备份目录（首次运行时）
mkdir -p "$BACKUP_DIR"

# 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 数据库不存在: $DB_FILE" >&2
  exit 1
fi

# 使用 SQLite .backup 命令进行安全备份（支持 WAL 模式，不会读到脏数据）
if command -v sqlite3 &>/dev/null; then
  sqlite3 "$DB_FILE" ".backup $BACKUP_FILE"
else
  # 降级：cp 方式（服务器未安装 sqlite3 CLI 时使用）
  cp "$DB_FILE" "$BACKUP_FILE"
fi

# 压缩备份文件
gzip "$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}.gz" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 备份完成: alog_${TIMESTAMP}.db.gz (${BACKUP_SIZE})"

# 删除超过 60 天的旧备份
DELETED=$(find "$BACKUP_DIR" -name "alog_*.db.gz" -mtime +${RETAIN_DAYS} -print -delete | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🗑  已清理过期备份: ${DELETED} 个"
fi

# 统计当前备份数量
COUNT=$(find "$BACKUP_DIR" -name "alog_*.db.gz" | wc -l)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📦 当前备份总数: ${COUNT} 个"
