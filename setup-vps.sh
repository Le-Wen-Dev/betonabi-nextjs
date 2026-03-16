#!/bin/bash

# ===========================================
# Setup script - Chạy lần đầu trên VPS
# ===========================================

set -e

echo "=== Setup Betonabi VPS ==="

# 1. Update system
echo "[1/7] Updating system..."
apt-get update
apt-get upgrade -y

# 2. Install Node.js 20.x
echo "[2/7] Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
node -v
npm -v

# 3. Install PM2
echo "[3/7] Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
pm2 -v

# 4. Install Nginx
echo "[4/7] Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi
nginx -v

# 5. Install Certbot for SSL
echo "[5/7] Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

# 6. Create directory
echo "[6/7] Creating app directory..."
mkdir -p /var/www/betonabi-nextjs
chown -R root:root /var/www/betonabi-nextjs

# 7. Setup firewall
echo "[7/7] Setting up firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=== Setup completed! ==="
echo ""
echo "Next steps:"
echo "1. Setup SSL certificate:"
echo "   certbot --nginx -d betonabi.com -d www.betonabi.com"
echo ""
echo "2. Run deploy.sh from your local machine:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"

