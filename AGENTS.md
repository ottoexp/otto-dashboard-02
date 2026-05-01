# AGENTS.md — Otto ERP Staging
---

##  Kondisi Aktual Project (2 Mei 2026)

### ✅ Status Umum
- ✅ Proyek sudah live di staging environment
- ✅ Frontend: https://staging.otto.my.id
- ✅ Backend API: https://staging-api.otto.my.id
- ✅ Semua service berjalan normal, semua endpoint return 200 OK
- ✅ PM2 dijalankan untuk API, auto restart pada boot server
- ✅ Branch aktif: `staging` (push setiap perubahan untuk safety)

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
- Top navigation layout (sidebar dihapus)
- Responsive mobile hamburger menu (< 768px)
- Auth guard otomatis
- Axios interceptor JWT
- Dashboard KPI + charts
- User management CRUD
- Semua halaman auth lengkap (login, register, OTP, lupa password)
- Customers, Inventory, Team CRUD pages
- Error tracking frontend (JSON daily logs)
- Theme switch & Config drawer di top menu kanan
- Profile dropdown (Users, Roles, Settings, Sign out)

### 📱 Menu Structure:
- Customer (flat)
- Sales (flat)
- Inventory (flat)
- Team (dropdown: Schedule, Absensi)
- Finance (dropdown: Cash, Bank, Ledger, Report, Pajak)

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
- JWT auth flow lengkap (verifyToken fix: map payload correctly)
- Role based permission middleware
- User & Roles CRUD
- Customers CRUD
- Inventory CRUD
- Team CRUD (full_name, phone, position, base_salary, etc.)
- Error logger utility
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
- Nginx: No-cache headers untuk staging

---

## 📌 Catatan Penting
1. **PUSH KE STAGING SETIAP PERUBAHAN** - untuk safety dan revert mudah
2. Kedua repo dalam kondisi production ready
3. Tidak ada broken code di branch saat ini
4. Semua fitur inti ERP sudah terimplementasi dasar
5. Belum ada: rate limit, logging terpusat, refresh token whitelist

##  Bug Fixes History
- JWT verifyToken: map payload fields correctly (userId, email, role)
- Auth store: wrap JSON.parse in try-catch for invalid cookies
- Config drawer: remove useSidebar dependency (sidebar removed)
- Team controller: add req.user check before accessing userId
- Nginx proxy_pass: localhost → 127.0.0.1 (fix 502)
- PM2: cleanup orphan processes, reset restart count
