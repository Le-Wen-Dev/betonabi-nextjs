#!/bin/bash

# ===========================================
# Deploy script cho betonabi.com - Next.js
# CHỈ TÁC ĐỘNG VÀO BETONABI.COM
# ===========================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Config
VPS_HOST="root@36.50.27.85"
VPS_DIR="/var/www/betonabi-nextjs"
OLD_DIR="/var/www/betonabi.com"
APP_NAME="betonabi-nextjs"
PORT=3000

echo -e "${GREEN}=== Deploy Betonabi Next.js ===${NC}"
echo -e "${YELLOW}WARNING: Chỉ tác động vào betonabi.com${NC}"
echo ""

# 1. Build locally
echo -e "${YELLOW}[1/7] Building Next.js...${NC}"
npm run build

# 2. Backup old React app
echo -e "${YELLOW}[2/7] Backing up old React app...${NC}"
ssh $VPS_HOST << 'ENDSSH'
# Backup old app if exists
if [ -d "/var/www/betonabi.com" ]; then
    echo "Backing up old React app..."
    cp -r /var/www/betonabi.com /var/www/betonabi.com.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backup completed!"
fi
ENDSSH

# 3. Create directory on VPS
echo -e "${YELLOW}[3/7] Creating directory on VPS...${NC}"
ssh $VPS_HOST "mkdir -p $VPS_DIR"

# 4. Sync files to VPS
echo -e "${YELLOW}[4/7] Syncing files to VPS...${NC}"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  --exclude '.env.local' \
  ./ $VPS_HOST:$VPS_DIR/

# 5. Install dependencies on VPS
echo -e "${YELLOW}[5/7] Installing dependencies on VPS...${NC}"
ssh $VPS_HOST << 'ENDSSH'
cd /var/www/betonabi-nextjs

# Install dependencies
npm install --production

ENDSSH

# 6. Backup old Nginx config and setup new one
echo -e "${YELLOW}[6/7] Setting up Nginx...${NC}"
scp nginx-betonabi.conf $VPS_HOST:/tmp/betonabi-nextjs.conf

ssh $VPS_HOST << 'ENDSSH'
# Backup old config
if [ -f "/etc/nginx/sites-available/betonabi.com" ]; then
    echo "Backing up old Nginx config..."
    cp /etc/nginx/sites-available/betonabi.com /etc/nginx/sites-available/betonabi.com.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy new config
cp /tmp/betonabi-nextjs.conf /etc/nginx/sites-available/betonabi.conf

# Remove old symlink and create new one
rm -f /etc/nginx/sites-enabled/betonabi.com
ln -sf /etc/nginx/sites-available/betonabi.conf /etc/nginx/sites-enabled/betonabi.conf

# Test nginx config
if nginx -t; then
    echo "Nginx config is valid!"
    systemctl reload nginx
    echo "Nginx reloaded successfully!"
else
    echo "ERROR: Nginx config is invalid! Rolling back..."
    rm -f /etc/nginx/sites-enabled/betonabi.conf
    ln -sf /etc/nginx/sites-available/betonabi.com /etc/nginx/sites-enabled/betonabi.com
    systemctl reload nginx
    exit 1
fi

ENDSSH

# 7. Start/Restart Next.js with PM2
echo -e "${YELLOW}[7/7] Starting Next.js with PM2...${NC}"
ssh $VPS_HOST << 'ENDSSH'
cd /var/www/betonabi-nextjs

# Stop old betonabi-nextjs process if exists
pm2 delete betonabi-nextjs 2>/dev/null || true

# Start Next.js
pm2 start npm --name "betonabi-nextjs" -- start

# Save PM2 process list
pm2 save

echo "PM2 configured successfully!"
ENDSSH

echo ""
echo -e "${GREEN}=== Deploy completed! ===${NC}"
echo -e "${GREEN}Next.js is running on port 3000${NC}"
echo -e "${GREEN}Visit: https://www.betonabi.com${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  ssh $VPS_HOST 'pm2 logs betonabi-nextjs'  # View logs"
echo "  ssh $VPS_HOST 'pm2 restart betonabi-nextjs'  # Restart app"
echo "  ssh $VPS_HOST 'pm2 status'  # Check status"
echo ""
echo -e "${YELLOW}Rollback if needed:${NC}"
echo "  ssh $VPS_HOST 'pm2 delete betonabi-nextjs'"
echo "  ssh $VPS_HOST 'rm /etc/nginx/sites-enabled/betonabi.conf'"
echo "  ssh $VPS_HOST 'ln -sf /etc/nginx/sites-available/betonabi.com /etc/nginx/sites-enabled/betonabi.com'"
echo "  ssh $VPS_HOST 'systemctl reload nginx'"

