#!/bin/bash
set -e

DEPLOY_DIR="/var/www/personal-blog"

echo "=== 开始部署个人博客系统 ==="

# 1. 安装后端依赖
echo "[1/5] 安装后端依赖..."
cd "$DEPLOY_DIR/server"
npm install --production

# 2. 运行数据库迁移
echo "[2/5] 运行数据库迁移..."
npm run migrate

# 3. 安装前端依赖并构建
echo "[3/5] 安装前端依赖..."
cd "$DEPLOY_DIR/client"
npm install

echo "[4/5] 构建前端..."
npm run build

# 4. 重启 PM2
echo "[5/5] 重启 PM2 进程..."
cd "$DEPLOY_DIR"
pm2 startOrRestart ecosystem.config.js --env production
pm2 save

echo "=== 部署完成 ==="
echo "访问 http://$(curl -s ifconfig.me) 查看博客"
