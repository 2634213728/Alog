# CI/CD 自动部署配置指南

## 方案概览

```
git push master
      │
      ▼
GitHub Actions
      │  SSH 连接
      ▼
Ubuntu 22.04 服务器
  git pull → npm ci → npm run build
  → prisma migrate deploy → pm2 reload
```

## 前置条件

- 已通过 `deploy.sh` 完成首次部署（项目位于 `/opt/alog`）
- 服务器已初始化 git 仓库并关联远程仓库
- PM2 进程 `alog` 已在运行

---

## 一、服务器端准备

### 1. 确认项目目录是 Git 仓库

在服务器上执行：

```bash
cd /opt/alog
git remote -v   # 应显示你的 GitHub 仓库地址
git status
```

如果不是 git 仓库，需重新克隆：

```bash
# 备份现有数据
cp /opt/alog/data/alog.db /tmp/alog.db.bak
cp /opt/alog/website/.env.production /tmp/.env.production.bak

# 重新克隆
sudo rm -rf /opt/alog
git clone https://github.com/<你的用户名>/alog.git /opt/alog

# 还原数据与配置
cp /tmp/alog.db.bak /opt/alog/data/alog.db
cp /tmp/.env.production.bak /opt/alog/website/.env.production
```

### 2. 生成 SSH 密钥对（专用于 CI/CD）

在**服务器**上执行：

```bash
# 生成专用密钥对
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""

# 将公钥加入授权列表
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 查看私钥（下一步需要填入 GitHub Secrets）
cat ~/.ssh/github_actions_deploy
```

### 3. 确保 update.sh 有执行权限

```bash
chmod +x /opt/alog/deploy/update.sh
```

---

## 二、GitHub Secrets 配置

前往 GitHub 仓库 → **Settings → Secrets and variables → Actions → New repository secret**

| Secret 名称         | 值                              | 说明                   |
|---------------------|---------------------------------|------------------------|
| `SSH_HOST`          | `your.server.ip`                | 服务器 IP 或域名       |
| `SSH_USER`          | `ubuntu`                        | SSH 登录用户名         |
| `SSH_PRIVATE_KEY`   | 上一步生成的私钥完整内容        | 包含 `-----BEGIN...`   |
| `SSH_PORT`          | `22`                            | SSH 端口（默认 22）    |

---

## 三、工作流文件

已创建于 `.github/workflows/deploy.yml`，触发条件：推送到 `master` 分支。

---

## 四、验证部署

### 手动触发测试

```bash
# 本地推送一个空提交测试
git commit --allow-empty -m "test: trigger CI/CD"
git push origin master
```

然后在 GitHub → **Actions** 页面查看运行状态。

### 查看服务器日志

```bash
# PM2 实时日志
pm2 logs alog

# 更新脚本日志（如有重定向）
tail -f /var/log/alog/out.log
```

---

## 五、安全建议

1. **最小权限原则**：在服务器上为 CI/CD 创建专用用户

   ```bash
   sudo adduser --disabled-password --gecos "" deployer
   sudo usermod -aG sudo deployer        # 若需要 sudo 权限
   sudo chown -R deployer:deployer /opt/alog
   ```

2. **限制 SSH 密钥权限**（在 `~/.ssh/authorized_keys` 中）：

   ```
   command="/opt/alog/deploy/update.sh",no-port-forwarding,no-X11-forwarding ssh-ed25519 AAAA...
   ```

3. **保护 `.env.production`**：确保该文件在 `.gitignore` 中，不提交到仓库

---

## 故障排查

| 问题 | 排查方法 |
|------|----------|
| `Permission denied (publickey)` | 检查 `SSH_PRIVATE_KEY` 是否完整，公钥是否在 `authorized_keys` |
| `npm run build` 失败 | 服务器上手动执行 `cd /opt/alog/website && npm run build` |
| PM2 进程不存在 | `pm2 list` 查看，或重新执行 `pm2 start ecosystem.config.cjs` |
| 数据库迁移失败 | 检查 `.env.production` 中 `DATABASE_URL` 路径是否正确 |
| 端口被占用 | `pm2 reload alog` 比 `pm2 restart` 更安全，避免瞬间断连 |
