#!/bin/bash
# 本地构建 + 上传部署脚本（避免在服务器上构建，防止 OOM）
set -e

SERVER="ubuntu@159.75.26.219"
REMOTE_DIR="/var/www/personal-blog"

echo "[1/4] 本地构建前端..."
cd "$(dirname "$0")/client"
npm run build

echo "[2/4] 上传 dist 到服务器..."
scp -r dist/ "$SERVER:$REMOTE_DIR/client/"

echo "[3/4] 同步后端代码..."
scp -r ../server/src/ "$SERVER:$REMOTE_DIR/server/"

echo "[4/4] 重启服务..."
ssh "$SERVER" "pm2 restart personal-blog && sudo systemctl reload nginx"

echo "=== 部署完成 ==="
