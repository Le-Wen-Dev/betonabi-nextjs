#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Betonabi Deploy Script${NC}\n"

# Step 1: Git commit and push
echo -e "${YELLOW}📝 Step 1: Git Commit & Push${NC}"

# Check if there are any changes
if [[ -z $(git status -s) ]]; then
    echo -e "${BLUE}ℹ️  No changes to commit, skipping git push${NC}\n"
else
    read -p "Enter commit message: " commit_message

    if [ -z "$commit_message" ]; then
        echo -e "${RED}❌ Commit message cannot be empty${NC}"
        exit 1
    fi

    echo "Adding all changes..."
    git add .

    echo "Committing changes..."
    git commit -m "$commit_message"

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Git commit failed${NC}"
        exit 1
    fi

    echo "Pushing to remote..."
    git push

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Git push failed${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Git push successful${NC}\n"
fi

# Step 2: Build locally
echo -e "${YELLOW}🔨 Step 2: Building Next.js app locally${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}\n"

# Step 3: Deploy to VPS
echo -e "${YELLOW}🚀 Step 3: Deploying to VPS${NC}"

VPS_HOST="36.50.27.85"
VPS_USER="root"
VPS_DIR="/var/www/betonabi-nextjs"
PM2_APP_NAME="betonabi-nextjs"

echo "Syncing files to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  --exclude '.env.local' \
  ./ ${VPS_USER}@${VPS_HOST}:${VPS_DIR}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ File sync failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Files synced${NC}\n"

# Step 4: Install dependencies and restart on VPS
echo -e "${YELLOW}🔄 Step 4: Installing dependencies and restarting app${NC}"

ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /var/www/betonabi-nextjs

echo "Installing dependencies..."
npm install --production

echo "Restarting PM2 app..."
pm2 restart betonabi-nextjs

echo "Checking app status..."
pm2 info betonabi-nextjs
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ VPS deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ VPS deployment successful${NC}\n"

# Step 5: Show final status
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo -e "  ${GREEN}✓${NC} Git committed and pushed"
echo -e "  ${GREEN}✓${NC} App built successfully"
echo -e "  ${GREEN}✓${NC} Files synced to VPS"
echo -e "  ${GREEN}✓${NC} App restarted on VPS"
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Visit: https://www.betonabi.com${NC}"

