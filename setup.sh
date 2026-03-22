#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SmartQ — Project Setup Script
# Run this once after extracting the zip into /media/mint/Data/git/
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗ ██████╗ "
echo "  ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗"
echo "  ███████╗██╔████╔██║███████║██████╔╝   ██║   ██║   ██║"
echo "  ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██║▄▄ ██║"
echo "  ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ╚██████╔╝"
echo "  ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚══▀▀═╝ "
echo -e "${NC}"
echo "  Hospital Queue Management System"
echo ""

# ─── Check Node version ───────────────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Checking Node.js version...${NC}"
NODE_VER=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Visit https://nodejs.org"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# ─── Install Turbo globally ───────────────────────────────────────────────────
echo -e "${YELLOW}[2/5] Installing Turbo CLI...${NC}"
npm install -g turbo@latest 2>/dev/null || true
echo -e "${GREEN}✓ Turbo ready${NC}"

# ─── Install all workspace deps ───────────────────────────────────────────────
echo -e "${YELLOW}[3/5] Installing all dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ─── Create .env files ────────────────────────────────────────────────────────
echo -e "${YELLOW}[4/5] Creating environment files...${NC}"

cat > apps/api/.env << 'EOF'
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartq
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-in-production-use-a-long-random-string
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_auth_token
TWILIO_FROM=+1234567890
WHATSAPP_TOKEN=your_whatsapp_business_api_token
EOF

cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXTAUTH_SECRET=change-me-in-production
NEXTAUTH_URL=http://localhost:3000
EOF

cat > apps/patient/.env << 'EOF'
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_WS_URL=http://localhost:4000
EOF

echo -e "${GREEN}✓ .env files created (update credentials before production)${NC}"

# ─── Done ─────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[5/5] Setup complete!${NC}"
echo ""
echo "  Start all apps:"
echo -e "  ${GREEN}npm run dev${NC}"
echo ""
echo "  Or individually:"
echo -e "  ${GREEN}npm run dev:web${NC}      → Next.js  → http://localhost:3000"
echo -e "  ${GREEN}npm run dev:api${NC}      → API      → http://localhost:4000"
echo -e "  ${GREEN}npm run dev:patient${NC}  → Expo     → http://localhost:8081"
echo ""
echo "  Pages:"
echo "  /login           Staff login"
echo "  /doctor/dashboard  Doctor queue view"
echo "  /admin/dashboard   Admin live dashboard"
echo "  /admin/analytics   Reports & charts"
echo "  /admin/users       User management"
echo "  /kiosk             Patient kiosk (touch)"
echo "  /display           TV display board"
echo ""
echo -e "${GREEN}✅ SmartQ is ready!${NC}"
