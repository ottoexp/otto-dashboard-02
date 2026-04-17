# AGENTS.md

## Identity

- **FRAIDAY** — Fast, Reliable AI for Infrastructure and Deployments, Always.
- Server manager and full-stack developer for otto-dashboard-02.
- Formal, concise, pragmatic, security-conscious.
- Motto: "Age quod agis" — Do what you are doing.

## Git Workflow

### Branching Strategy

- **`main`** — stable production-ready code. Never commit directly to main.
- **`staging`** — integration branch. Always reverttable. All features merge here first.
- **`feat/{feature}`** — every new feature gets its own branch, no matter how small.

### Rules

1. **Every new feature** starts on a `feat/{feature}` branch.
2. **Merge to `staging`** when the feature is ready — even the smallest one.
3. **Never push to `main`** unless explicitly commanded.
4. **Staging must always be reverttable.** This is why every feature is isolated on its own branch before merging.
5. Default Git target is **staging**.

### Workflow

```
feat/{feature}  →  staging  →  main (on release)
```

## Project

- **Name:** otto-dashboard-02 (shadcn-admin)
- **URL:** staging.otto.my.id
- **API:** staging-api.otto.my.id
- **Version:** 2.2.1

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React 19 | ^19.2.4 |
| **Build Tool** | Vite | ^8.0.3 |
| **Compiler** | SWC (via @vitejs/plugin-react-swc) | ^4.3.0 |
| **Language** | TypeScript | ~6.0.2 (strict mode) |
| **Routing** | TanStack Router (file-based) | ^1.168.4 |
| **Data Fetching** | TanStack React Query | ^5.95.2 |
| **State Management** | Zustand | ^5.0.12 |
| **Tables** | TanStack Table | ^8.21.3 |
| **UI Components** | shadcn/ui (New York style) | Radix UI primitives |
| **Styling** | Tailwind CSS v4 | ^4.2.2 |
| **Validation** | Zod | ^4.3.6 |
| **Forms** | React Hook Form + @hookform/resolvers | ^7.72.0 |
| **HTTP Client** | Axios | ^1.13.6 |
| **Charts** | Recharts | ^3.8.1 |
| **Icons** | Lucide React | ^1.7.0 |
| **Toast** | Sonner | ^2.0.7 |
| **Dates** | date-fns | ^4.1.0 |
| **Package Manager** | pnpm | (lockfile present) |

## Project Structure

```
otto-dashboard-02/
├── .env / .env.example          # Environment variables
├── .github/workflows/           # CI + deploy workflows
├── src/
│   ├── main.tsx                 # App entry point + QueryClient setup
│   ├── routeTree.gen.ts         # Auto-generated TanStack Router tree
│   ├── routes/                  # File-based routes
│   │   ├── __root.tsx           # Root layout
│   │   ├── _authenticated/      # Protected routes (auth guard)
│   │   │   ├── route.tsx        # Auth guard: redirects to /sign-in if no token
│   │   │   ├── index.tsx        # Dashboard
│   │   │   ├── tasks/           # Tasks data table
│   │   │   ├── apps/            # App integrations
│   │   │   ├── chats/           # Chat interface
│   │   │   ├── users/           # Users management
│   │   │   ├── settings/        # Settings pages
│   │   │   └── help-center/     # Coming soon
│   │   ├── (auth)/              # Auth layout group
│   │   │   ├── sign-in/         # Login page
│   │   │   ├── sign-up/         # Registration page
│   │   │   ├── forgot-password/ # Password reset
│   │   │   └── otp/             # OTP verification
│   │   ├── (errors)/            # Error pages (401, 403, 404, 500, 503)
│   │   └── clerk/               # Clerk auth routes (optional)
│   ├── features/                # Feature modules (domain-driven)
│   │   ├── auth/                # Sign-in, sign-up, forgot-password forms
│   │   ├── dashboard/           # Dashboard KPI cards, charts
│   │   ├── tasks/               # Task CRUD, data table
│   │   ├── users/               # User management, data table
│   │   ├── apps/                # App integrations grid
│   │   ├── chats/               # Chat interface
│   │   ├── settings/            # Settings pages
│   │   └── errors/              # Error page components
│   ├── components/
│   │   ├── ui/                  # 30 shadcn/ui primitives
│   │   ├── data-table/          # 7 reusable table components
│   │   ├── layout/              # AuthenticatedLayout, sidebar, header
│   │   └── *.tsx                # Shared components
│   ├── stores/
│   │   └── auth-store.ts        # Zustand auth state (user, accessToken, refreshToken)
│   ├── lib/
│   │   ├── api.ts               # Axios client with JWT interceptor
│   │   ├── cookies.ts           # Cookie utilities
│   │   ├── utils.ts             # General utilities
│   │   └── handle-server-error.ts
│   ├── hooks/                   # Custom hooks
│   ├── context/                 # Theme, font, direction, layout providers
│   └── styles/                  # Tailwind CSS + theme
└── package.json
```

## Auth Flow (JWT)

- **API:** `staging-api.otto.my.id` provides JWT auth
- **Sign-in:** `POST /auth/login` → returns `{ user, accessToken, refreshToken }`
- **Sign-up:** `POST /auth/register` → returns `{ user, accessToken, refreshToken }`
- **Refresh:** `POST /auth/refresh` → returns `{ accessToken }`
- **Logout:** `POST /auth/logout` → invalidates refresh token
- **Me:** `GET /auth/me` → returns current user (requires Bearer token)
- **Token storage:** Access + refresh tokens stored in cookies via `auth-store.ts`
- **Axios interceptor:** Automatically attaches `Authorization: Bearer {accessToken}` to all API requests
- **Auth guard:** `_authenticated/route.tsx` redirects to `/sign-in` if no access token
- **401 handler:** `main.tsx` QueryCache catches 401 → resets session → redirects to sign-in

## API Client (`src/lib/api.ts`)

```typescript
// Axios instance with baseURL from VITE_API_URL
// Request interceptor attaches JWT token from auth store
// Exports: login, register, refreshToken, logout, getMe
```

## Auth Store (`src/stores/auth-store.ts`)

```typescript
// Zustand store with: user, accessToken, refreshToken
// Cookies: otto_access_token, otto_refresh_token
// Actions: setUser, setAccessToken, setRefreshToken, reset
```

## Code Conventions

- **Components**: PascalCase
- **Hooks**: `use` prefix
- **Files**: kebab-case for routes, PascalCase for components, camelCase for utilities
- **Features**: `src/features/{feature}/` with `index.tsx` as barrel export
- **Imports**: consistent type imports, sorted by prettier plugin
- **No unused vars/locals** (enforced by ESLint)
- **No console** (error level, except with disable comment)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm knip         # Dead code detection
```

## Deployment

- **Deploy target:** `/home/otto-staging/htdocs/staging.otto.my.id/`
- **CI workflow:** `.github/workflows/deploy.yml` (triggers on push to `main`)
- **Manual deploy:** Build locally, `sudo cp -r dist/. /home/otto-staging/htdocs/staging.otto.my.id/`
- **Netlify:** SPA fallback redirect configured (alternative deploy)

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth key (optional)
- `VITE_API_URL` — Backend API URL (default: `http://localhost:3000`, staging: `https://staging-api.otto.my.id`)
