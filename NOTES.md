# NOTES — otto-dashboard-02

## Pending Work

### Switch CI from pnpm to npm

**Why:** Team wants to standardize on npm across all CI pipelines.

**What to do:**
1. Delete `pnpm-lock.yaml` from the repo
2. Run `npm install` locally to generate `package-lock.json`
3. Add `package-lock.json` to `.gitignore` (to avoid runner compat issues — see below)
4. Update `.github/workflows/deploy.yml`:
   - Remove `pnpm/action-setup` step
   - Remove `cache: "pnpm"` from setup-node
   - Change `pnpm install` → `npm install`
   - Change `pnpm build` → `npm run build`
5. Commit and push → verify CI passes

**Important — lockfile compat issue:**
Previous attempts with `npm ci` and `npm install` both failed with:
> `npm error Exit handler never called!`

Root cause: `package-lock.json` generated on Ubuntu server (Node 22.22.2) was
incompatible with the GitHub Actions runner npm version.

**Fix that worked:** Do NOT commit `package-lock.json` — add it to `.gitignore`
so the runner always generates a fresh one. Use `npm install` (not `npm ci`).

---

## Project Info

- **Repo:** https://github.com/ottoexp/otto-dashboard-02
- **Source:** https://github.com/satnaing/shadcn-admin (cloned, git history stripped)
- **Framework:** Vite + React (NOT Next.js) — builds to `dist/`
- **Deploy target:** staging.otto.my.id (otto-staging user, `/home/otto-staging/htdocs/staging.otto.my.id/`)
- **Server:** otto-srikandi01 (43.160.241.9, ubuntu user)
- **Auth:** Local `useAuthStore` — no real backend needed for demo. Clerk is optional (set `VITE_CLERK_PUBLISHABLE_KEY` in GitHub secrets)
- **Local path on server:** `/home/ubuntu/github/otto-dashboard-02`

## GitHub Secrets (already set)
- `SSH_HOST` = 43.160.241.9
- `SSH_USER` = ubuntu
- `SSH_PASS` = (in secrets.json on Mac)
- `VITE_CLERK_PUBLISHABLE_KEY` = pk_test_placeholder
