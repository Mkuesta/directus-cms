#!/bin/bash
set -e

echo "==================================="
echo "Directus VPS Setup Script"
echo "==================================="

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 22 (required for Directus 11)
echo "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verify Node.js version
echo "Node.js version:"
node --version
npm --version

# Create directus directory
echo "Creating Directus directory..."
mkdir -p ~/directus-backend
cd ~/directus-backend

# Initialize npm project
echo "Initializing npm project..."
npm init -y

# Install Directus and PostgreSQL driver
echo "Installing Directus..."
npm install directus pg

# Create .env file
echo "Creating .env file..."
cat > .env << 'EOF'
####################################
# GENERAL SETTINGS
####################################
PUBLIC_URL=http://YOUR_VPS_IP:8055
PORT=8055
LOG_LEVEL=info

####################################
# DATABASE - SUPABASE POSTGRESQL
####################################
DB_CLIENT=pg
DB_HOST=db.bkxtfznmmnsjllogwazf.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=Test128920251289
DB_SSL=true
DB_SSL__REJECT_UNAUTHORIZED=false
DB_SEARCH_PATH=directus

####################################
# ADMIN ACCOUNT
####################################
ADMIN_EMAIL=admin@vorlagen.de
ADMIN_PASSWORD=SecureDirectus2024!

####################################
# SECURITY KEYS
####################################
KEY=f14386e39c807b4cccc97bb3e7f47a3ef8b115e2e61b84e731812284657dd21c
SECRET=eb944cc442687689036fe8399921a6e092ea0c70b5837af93ee3d080add8e7bf2ead0dac6dde6e477b480517f94bc5a47dc0a9b665c63cd42eba09b1d8105959

####################################
# CORS
####################################
CORS_ENABLED=true
CORS_ORIGIN=true
EOF

echo "✓ .env file created"

# Bootstrap Directus database
echo "Bootstrapping Directus database..."
npx directus bootstrap

echo ""
echo "==================================="
echo "✅ Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Open firewall: ufw allow 8055/tcp"
echo "2. Start Directus: npx directus start"
echo "3. Access admin panel at: http://YOUR_VPS_IP:8055"
echo ""
