# SmartQ — Hospital Queue Management System

A full-stack monorepo built with **Turborepo**, **Next.js**, **Expo (React Native)**, and **Node.js/Express**.

## 📁 Project structure

```
smartq/
├── apps/
│   ├── web/          ← Next.js 14 (doctor dashboard, admin panel, kiosk, display board)
│   ├── patient/      ← Expo 51 (React Native patient app — iOS + Android + PWA)
│   └── api/          ← Node.js + Express + Socket.io backend
├── packages/
│   ├── types/        ← Shared TypeScript types
│   ├── api-client/   ← Shared API fetch wrapper
│   ├── queue-logic/  ← Flow 5 priority engine + token state machine
│   └── ui-tokens/    ← Design tokens
└── turbo.json
```

## 🚀 Quick start

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Redis 7+

### 1. Clone and install

```bash
# Copy this folder to your project location
cp -r smartq/ /media/mint/Data/git/smartq
cd /media/mint/Data/git/smartq

# Install all dependencies
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### 3. Start development servers

```bash
# All apps at once (recommended)
npm run dev

# Individual apps
npm run dev:web      # Next.js → http://localhost:3000
npm run dev:api      # API     → http://localhost:4000
npm run dev:patient  # Expo    → scan QR with Expo Go app
```

## 🌐 App URLs (development)

| Surface | URL | Description |
|---|---|---|
| Login | http://localhost:3000/login | Role-based sign-in |
| Doctor dashboard | http://localhost:3000/doctor/dashboard | Queue + consultation |
| Admin dashboard | http://localhost:3000/admin/dashboard | Live system control |
| Admin analytics | http://localhost:3000/admin/analytics | Heatmap + throughput |
| Admin users | http://localhost:3000/admin/users | Staff management |
| Kiosk terminal | http://localhost:3000/kiosk | Touch-screen patient flow |
| Display board | http://localhost:3000/display | TV screen — live queue |
| API health | http://localhost:4000/health | Backend status |

## 📱 Patient app (Expo)

```bash
cd apps/patient
npx expo start
# Scan QR with Expo Go (iOS/Android)
# Press 'w' for web/PWA
```

## 🗄️ Database setup

```sql
-- Run in psql
CREATE DATABASE smartq;
CREATE USER smartq WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE smartq TO smartq;
```

Then run migrations (TODO: add Prisma or pg-migrate setup).

## 🔧 Tech stack

| Layer | Technology |
|---|---|
| Web frontend | Next.js 14 (App Router) + Tailwind CSS |
| Mobile app | Expo 51 + React Native |
| Backend API | Node.js + Express + Socket.io |
| Queue logic | Shared TypeScript package |
| Database | PostgreSQL (persistent) + Redis (live queue) |
| Notifications | Twilio SMS + WhatsApp Business API |
| Monorepo | Turborepo |
| Auth | JWT (staff) + OTP via SMS (patients) |

## 📋 Flow coverage

| SmartQ Flow | Implementation |
|---|---|
| Flow 1 — System architecture | `apps/api` + WebSocket service |
| Flow 2 — Patient journey | `apps/patient` + `apps/web/kiosk` |
| Flow 3 — Kiosk terminal | `apps/web/src/app/kiosk/page.tsx` |
| Flow 4 — Doctor dashboard | `apps/web/src/app/doctor/dashboard/page.tsx` |
| Flow 5 — Queue engine | `packages/queue-logic/src/index.ts` |
| Flow 6 — Admin control | `apps/web/src/app/admin/` |
| Flow 7 — Failure recovery | Kiosk offline (IndexedDB), Redis AOF |

## 🚢 Production deployment

- **Web + API**: Docker + any VPS (DigitalOcean, Hetzner)
- **Patient app**: Expo EAS Build → Google Play + App Store
- **DB**: Managed PostgreSQL (Supabase, Neon, or Railway)
- **Redis**: Upstash or self-hosted

## 📞 Support

Built for Indian hospital OPD workflow. Designed for Flow 7 (worst-case) resilience.
