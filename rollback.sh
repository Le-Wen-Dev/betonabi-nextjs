#!/bin/bash

# ===========================================
# Rollback script - Khôi phục React app cũ
# ===========================================

set -e

VPS_HOST="root@36.50.27.85"

echo "=== Rollback Betonabi to React app ==="
echo ""
echo "This will:"
echo "  1. Stop betonabi-nextjs PM2 process"
echo "  2. Restore old Nginx config"
echo "  3. Reload Nginx"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

ssh $VPS_HOST << 'ENDSSH'
# Stop Next.js
pm2 delete betonabi-nextjs 2>/dev/null || true
pm2 save

# Restore old Nginx config
rm -f /etc/nginx/sites-enabled/betonabi.conf
ln -sf /etc/nginx/sites-available/betonabi.com /etc/nginx/sites-enabled/betonabi.com

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo "Rollback completed!"
ENDSSH

echo ""
echo "=== Rollback completed! ==="
echo "React app is now serving at https://www.betonabi.com"

