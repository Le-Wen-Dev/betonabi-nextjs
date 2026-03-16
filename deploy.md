# Betonabi Deploy Guide

apirole create của bảng blog 

@request.auth.role="admin" ||
(
  @request.auth.role="author" &&
  @request.body.author=@request.auth.id &&
  (@request.body.status="draft" || @request.body.status="pending") &&
  @request.auth.allowedCategories.id ?= @request.body.category
)


## Thông tin đăng nhập

### Admin web
- URL: betonabi.com/admin
- Email: admin@gmail.com
- Password: admin@gmail.com

### Pocketbase UI admin
- URL: apibetonabi.vmst.com.vn/_
- Email: adminbackendbetonabi@gmail.com
- Password: adminbackendbetonabi@!#!###@

### VPS
- IP: 36.50.27.85
- Password: E@gUrVfX9hb3$BFK

---

## Lần đầu setup VPS

### 1. Chạy setup script trên VPS
```bash
ssh root@36.50.27.85 'bash -s' < setup-vps.sh
```

### 2. Setup SSL certificate
```bash
ssh root@36.50.27.85
certbot --nginx -d betonabi.com -d www.betonabi.com
```

### 3. Disable frontend cũ (nếu có)
```bash
ssh root@36.50.27.85

# Kiểm tra config cũ
ls -la /etc/nginx/sites-enabled/

# Disable config cũ (backup trước)
mv /etc/nginx/sites-enabled/betonabi-old.conf /etc/nginx/sites-available/betonabi-old.conf.backup

# Reload nginx
nginx -t && systemctl reload nginx
```

---

## Deploy Next.js

### Chạy deploy script từ local
```bash
./deploy.sh
```

---

## Quản lý app

### Xem logs
```bash
ssh root@36.50.27.85 'pm2 logs betonabi-nextjs'
```

### Restart app
```bash
ssh root@36.50.27.85 'pm2 restart betonabi-nextjs'
```

### Check status
```bash
ssh root@36.50.27.85 'pm2 status'
```

### Stop app
```bash
ssh root@36.50.27.85 'pm2 stop betonabi-nextjs'
```

---

## Troubleshooting

### Check Nginx config
```bash
ssh root@36.50.27.85 'nginx -t'
```

### Check Nginx logs
```bash
ssh root@36.50.27.85 'tail -f /var/log/nginx/error.log'
```

### Check if port 3000 is running
```bash
ssh root@36.50.27.85 'netstat -tulpn | grep 3000'
```

### Restart Nginx
```bash
ssh root@36.50.27.85 'systemctl restart nginx'
```

---

## Deploy cũ (React - deprecated)
```bash
npm run build
rsync -avz --delete dist/ root@36.50.27.85:/var/www/betonabi.com
```
