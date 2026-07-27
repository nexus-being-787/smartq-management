<div align="center">

# 🏥 SmartQ

### A modern hospital queue management system built with **Turborepo**, **Next.js**, **Expo**, and **Node.js/Express**

Streamline OPD workflows with role-based dashboards, a patient mobile app, real-time queue updates, and a resilient backend designed for high-volume hospital operations.

<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

</div>

---

## ✨ Overview

SmartQ is a full-stack hospital queue management platform built for smooth patient flow and staff coordination.

It combines:

* a **web app** for doctors, admins, kiosks, and display boards
* a **patient app** for mobile queue access
* a **real-time API** for queue state, notifications, and live updates
* a **shared monorepo architecture** for scalable development

Designed with Indian OPD workflows in mind, SmartQ focuses on speed, clarity, and reliability.

---

## 📁 Project Structure

```text
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

---

## 🚀 Quick Start

### Prerequisites

* Node.js 20+
* npm 10+
* PostgreSQL 16+
* Redis 7+

### 1) Clone and install

```bash
# Copy this folder to your project location
cp -r smartq/ /media/mint/Data/git/smartq
cd /media/mint/Data/git/smartq

# Install all dependencies
npm install
```

### 2) Set up environment variables

```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### 3) Start development servers

```bash
# All apps at once (recommended)
npm run dev

# Individual apps
npm run dev:web      # Next.js → http://localhost:3000
npm run dev:api      # API     → http://localhost:4000
npm run dev:patient  # Expo    → scan QR with Expo Go app
```

---

## 🌐 App URLs

| Surface          | URL                                    | Description               |
| ---------------- | -------------------------------------- | ------------------------- |
| Login            | http://localhost:3000/login            | Role-based sign-in        |
| Doctor dashboard | http://localhost:3000/doctor/dashboard | Queue + consultation      |
| Admin dashboard  | http://localhost:3000/admin/dashboard  | Live system control       |
| Admin analytics  | http://localhost:3000/admin/analytics  | Heatmap + throughput      |
| Admin users      | http://localhost:3000/admin/users      | Staff management          |
| Kiosk terminal   | http://localhost:3000/kiosk            | Touch-screen patient flow |
| Display board    | http://localhost:3000/display          | TV screen — live queue    |
| API health       | http://localhost:4000/health           | Backend status            |

---

## 📱 Patient App

The patient app is built with **Expo 51** and supports:

* iOS
* Android
* PWA / web preview

### Run it locally

```bash
cd apps/patient
npx expo start
# Scan QR with Expo Go (iOS/Android)
# Press 'w' for web/PWA
```

---

## 🗄️ Database Setup

```sql
-- Run in psql
CREATE DATABASE smartq;
CREATE USER smartq WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE smartq TO smartq;
```

Then run your migrations.

> Migration tooling is currently marked as a TODO, so you can wire in Prisma, pg-migrate, or your preferred setup.

---

## 🔧 Tech Stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Web frontend  | Next.js 14 (App Router) + Tailwind CSS       |
| Mobile app    | Expo 51 + React Native                       |
| Backend API   | Node.js + Express + Socket.io                |
| Queue logic   | Shared TypeScript package                    |
| Database      | PostgreSQL (persistent) + Redis (live queue) |
| Notifications | Twilio SMS + WhatsApp Business API           |
| Monorepo      | Turborepo                                    |
| Auth          | JWT (staff) + OTP via SMS (patients)         |

---

## 📋 Flow Coverage

| SmartQ Flow                  | Implementation                               |
| ---------------------------- | -------------------------------------------- |
| Flow 1 — System architecture | `apps/api` + WebSocket service               |
| Flow 2 — Patient journey     | `apps/patient` + `apps/web/kiosk`            |
| Flow 3 — Kiosk terminal      | `apps/web/src/app/kiosk/page.tsx`            |
| Flow 4 — Doctor dashboard    | `apps/web/src/app/doctor/dashboard/page.tsx` |
| Flow 5 — Queue engine        | `packages/queue-logic/src/index.ts`          |
| Flow 6 — Admin control       | `apps/web/src/app/admin/`                    |
| Flow 7 — Failure recovery    | Kiosk offline (IndexedDB), Redis AOF         |

---

## 🚢 Production Deployment

* **Web + API**: Docker + any VPS such as DigitalOcean or Hetzner
* **Patient app**: Expo EAS Build → Google Play + App Store
* **Database**: Managed PostgreSQL such as Supabase, Neon, or Railway
* **Redis**: Upstash or self-hosted

---

## 🎯 Why SmartQ

SmartQ is built to help hospitals manage queues with less friction and more visibility.

It aims to improve:

* patient experience
* staff efficiency
* consultation flow
* queue transparency
* operational resilience

---

## 📞 Support

Built for Indian hospital OPD workflow.

Designed with **Flow 7 resilience** in mind for real-world failures, offline recovery, and busy clinic environments.

---

<div align="center">

**SmartQ — calm queues, clearer workflows, better hospital operations.**

</div>
