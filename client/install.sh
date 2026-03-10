#!/usr/bin/env bash
# ============================================================
# Alog Shell 函数安装脚本
# 用法: bash install.sh
# ============================================================

ALOG_SERVER="${ALOG_SERVER:-http://localhost:3000}"
ALOG_SOURCE="${ALOG_SOURCE:-unknown}"
SHELL_RC=""

# 检测 shell 类型
if [ -n "$ZSH_VERSION" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  SHELL_RC="$HOME/.bashrc"
else
  SHELL_RC="$HOME/.profile"
fi

echo "📌 Alog 函数将安装到: $SHELL_RC"
echo "   服务器地址: $ALOG_SERVER"
echo ""

read -p "请输入你的 ALOG_API_KEY: " USER_API_KEY
read -p "请输入 ALOG_SOURCE（如 cursor / copilot / claude）: " USER_SOURCE
read -p "请输入 ALOG_SERVER 地址（直接回车使用 $ALOG_SERVER）: " USER_SERVER
USER_SERVER="${USER_SERVER:-$ALOG_SERVER}"

FUNCTIONS=$(cat << 'FUNC_EOF'

# ========== Alog 工作日志函数 ==========
export ALOG_API_KEY="__API_KEY__"
export ALOG_SOURCE="__SOURCE__"
export ALOG_SERVER="__SERVER__"

生成alog日报() {
  local content tags payload
  # 接收管道内容
  if [ -t 0 ]; then
    echo "请通过管道传入内容，例如："
    echo "  echo '今日完成...' | 生成alog日报 '标签1,标签2'"
    return 1
  fi
  content=$(cat -)
  tags="${1:-}"
  payload=$(jq -n \
    --arg type "daily" \
    --arg title "日报 — $(date '+%Y-%m-%d')" \
    --arg content "$content" \
    --arg source "$ALOG_SOURCE" \
    --arg workspace "$PWD" \
    --arg tags "$tags" \
    '{type: $type, title: $title, content: $content, source: $source, workspace: $workspace, tags: $tags}')
  response=$(curl -s -w "\n%{http_code}" -X POST "$ALOG_SERVER/api/logs" \
    -H "Authorization: Bearer $ALOG_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "201" ]; then
    echo "✅ 日报已发布到 Alog"
  else
    echo "❌ 发布失败 (HTTP $http_code): $(echo "$response" | head -1)"
  fi
}

生成alog博客() {
  local content title tags payload
  if [ -t 0 ]; then
    echo "请通过管道传入内容，例如："
    echo "  echo '# 标题\n内容...' | 生成alog博客 '博客标题' '标签1,标签2'"
    return 1
  fi
  content=$(cat -)
  title="${1:-}"
  tags="${2:-}"
  payload=$(jq -n \
    --arg type "blog" \
    --arg title "$title" \
    --arg content "$content" \
    --arg source "$ALOG_SOURCE" \
    --arg workspace "$PWD" \
    --arg tags "$tags" \
    '{type: $type, title: $title, content: $content, source: $source, workspace: $workspace, tags: $tags}')
  response=$(curl -s -w "\n%{http_code}" -X POST "$ALOG_SERVER/api/logs" \
    -H "Authorization: Bearer $ALOG_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "201" ]; then
    echo "✅ 博客已发布到 Alog"
  else
    echo "❌ 发布失败 (HTTP $http_code): $(echo "$response" | head -1)"
  fi
}
# ========== End Alog ==========
FUNC_EOF
)

# 替换占位符
FUNCTIONS="${FUNCTIONS//__API_KEY__/$USER_API_KEY}"
FUNCTIONS="${FUNCTIONS//__SOURCE__/$USER_SOURCE}"
FUNCTIONS="${FUNCTIONS//__SERVER__/$USER_SERVER}"

# 写入 shell 配置
echo "" >> "$SHELL_RC"
echo "$FUNCTIONS" >> "$SHELL_RC"

echo ""
echo "✅ 安装完成！"
echo "   执行以下命令使配置生效："
echo "   source $SHELL_RC"
echo ""
echo "📖 使用方法："
echo "   echo '今日内容...' | 生成alog日报 '标签1,标签2'"
echo "   echo '# 博客内容' | 生成alog博客 '博客标题' '标签1,标签2'"
