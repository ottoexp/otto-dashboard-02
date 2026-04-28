# AGENTS.md — Otto ERP Staging
---

## 📌 Kondisi Aktual Project (28 April 2026)

### ✅ Status Umum
- ✅ Proyek sudah live di staging environment
- ✅ Frontend: https://staging.otto.my.id
- ✅ Backend API: https://staging-api.otto.my.id
- ✅ Semua service berjalan normal, semua endpoint return 200 OK
- ✅ PM2 dijalankan untuk API, auto restart pada boot server

---

## 📦 Repo Structure

```
otto-erp/
├── otto-dashboard-02/   # Frontend Dashboard
└── otto-api/            # Backend REST API
```

---

## 🖥️ Frontend: otto-dashboard-02

| Item | Nilai |
|---|---|
| Stack | React 19 + Vite 8 + TypeScript 6 |
| Package Manager | pnpm |
| Dev Port | 5173 |
| Build Output | `dist/` |
| UI | shadcn/ui + Tailwind CSS v4 + Radix UI |
| Routing | TanStack Router (file based) |
| Data | TanStack React Query + Zustand |
| Auth | JWT native, auto refresh token |

### Perintah:
```bash
pnpm dev          # Jalankan dev server
pnpm build        # Build production
pnpm lint
pnpm format
```

### ✅ Fitur yang sudah jalan:
- Full responsive layout sidebar + header
- Auth guard otomatis
- Axios interceptor JWT
- Dashboard KPI + charts
- User management CRUD
- Semua halaman auth lengkap (login, register, OTP, lupa password)

---

## ⚙️ Backend: otto-api

| Item | Nilai |
|---|---|
| Stack | Express.js + TypeScript + MySQL |
| Runtime | Node.js >= 22 |
| Package Manager | npm |
| Default Port | 3000 |
| Database | MySQL 8 / Percona Server |
| Auth | bcryptjs + jsonwebtoken |
| Validation | Zod |

### Perintah:
```bash
npm run dev       # Dev server hot reload
npm run build     # Compile TS
npm run start     # Production mode
npm run db:migrate
npm run db:seed
```

### ✅ Fitur yang sudah jalan:
- Auto migrate database saat startup
- JWT auth flow lengkap
- Role based permission middleware
- User & Roles CRUD
- Global error handler
- Health check `/health`

### Default Credential:
```
Email: admin@otto.my.id
Password: admin123
Role: super-admin
```

---

## 🌐 Deployment

- Frontend: Static build deploy ke `/var/www/staging.otto.my.id` via Nginx
- Backend: PM2 process manager, port 3001, di proxies Nginx
- Database: Percona Server 8.0.45, systemd enabled
- Tunnel: Cloudflare Tunnel `janur02`

---

## 📌 Catatan Penting
1. Kedua repo dalam kondisi production ready
2. Tidak ada broken code di branch saat ini
3. Semua fitur inti ERP sudah terimplementasi dasar
4. Belum ada: rate limit, logging terpusat, refresh token whitelist
