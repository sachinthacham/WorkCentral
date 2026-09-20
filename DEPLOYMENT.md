# Deployment

Production topology:

| Piece    | Host                              | Tier              | URL |
|----------|-----------------------------------|-------------------|-----|
| Frontend | Vercel                            | Hobby (free)      | _set after first deploy_ |
| API      | Azure App Service, Linux, East Asia | **F1 (Free)**   | https://wms-api-sachintha.azurewebsites.net |
| Database | MongoDB Atlas (`cluster0.vu2pm9w`) | M0 (free, 512 MB) | db `saas-platform` |
| CI/CD    | GitHub Actions                    | —                 | `.github/workflows/ci-cd.yml` |

Atlas is used rather than Cosmos DB because the search module relies on MongoDB
`$text` indexes, which the Cosmos DB Mongo API does not support.

## Azure resources (already provisioned)

```
Subscription    Azure for Students (8cc5fd52-7a69-4c3b-a0ad-36066b80c983)
Resource group  rg-workspace-mgmt        (East Asia)
App Service plan asp-workspace-f1        (Linux, F1)
Web App         wms-api-sachintha        (NODE|22-lts)
```

Settings applied: startup command `node dist/main.js`, Web Sockets **on**
(needed by the Socket.IO gateway), HTTPS-only, Always On **off** (F1 forbids it).

## What the F1 tier means in practice

- **No Always On.** The container unloads after ~20 minutes idle; the next
  request pays a 30–60 s cold start. `.github/workflows/keep-warm.yml` pings
  `/health` every 10 minutes to prevent this. See the interview checklist below.
- **60 CPU-minutes/day.** Exceeding it makes the app return HTTP 403 until
  00:00 UTC. Normal demo traffic is nowhere near this; the health pings are
  negligible. Avoid load-testing it the day of a demo.
- **1 GB RAM / 1 GB disk.** Too small to build reliably on the instance, so CI
  ships a prebuilt `dist` + production `node_modules`
  (`SCM_DO_BUILD_DURING_DEPLOYMENT=false`). `bcrypt` is a native module, so
  those `node_modules` must be built on Linux — the workflow does this on
  `ubuntu-latest`, which matches the App Service runtime. **Never zip-deploy
  `node_modules` built on Windows.**
- **5 concurrent WebSocket connections.** Fine for a demo, not for a crowd.
- **No custom domain / no SSL for custom domains.** `*.azurewebsites.net` only.

## Environment variables

### API — Azure App Service → Configuration → Application settings

| Name | Value | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://…/saas-platform?retryWrites=true&w=majority` | from Atlas |
| `JWT_SECRET` | *(generated, already set)* | 64-char random |
| `CORS_ORIGINS` | `https://<your-app>.vercel.app` | comma-separated allowlist |
| `CORS_ORIGIN_REGEX` | `^https://.*\.vercel\.app$` | optional, allows preview deploys |
| `APP_URL` | `https://<your-app>.vercel.app` | used for links inside emails |
| `UPLOADS_DIR` | `/home/data/uploads` | `/home` persists across redeploys |
| `NODE_ENV` | `production` | |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` | CI ships a prebuilt package |
| `WEBSITES_ENABLE_APP_SERVICE_STORAGE` | `true` | keeps `/home` mounted |

`PORT` is injected by App Service — do not set it.

### Client — Vercel → Settings → Environment Variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://wms-api-sachintha.azurewebsites.net` |

`NEXT_PUBLIC_*` is inlined at **build** time, so changing it requires a redeploy.

### GitHub Actions secrets

| Secret | Purpose | Status |
|---|---|---|
| `AZURE_CLIENT_ID` | OIDC federated login | ✅ set |
| `AZURE_TENANT_ID` | OIDC federated login | ✅ set |
| `AZURE_SUBSCRIPTION_ID` | OIDC federated login | ✅ set |
| `VERCEL_TOKEN` | Vercel CLI auth | ⬜ pending |
| `VERCEL_ORG_ID` | Vercel project targeting | ⬜ pending |
| `VERCEL_PROJECT_ID` | Vercel project targeting | ⬜ pending |
| `MONGO_URI` | used only by the manual seed workflow | ✅ set |

Repository **variable** (not secret) `NEXT_PUBLIC_API_URL` is used by the client
CI build step.

There is no Azure password or publish profile stored in GitHub: the API deploy
authenticates with a short-lived OIDC token federated to an Entra app
registration (`gh-deploy-workspace-mgmt`) scoped as Contributor on
`rg-workspace-mgmt` only.

## Pipeline

`.github/workflows/ci-cd.yml`, on push to `main`:

```
test-api ─┐
          ├─> deploy-api     (build on Linux → zip → OIDC → App Service → poll /health)
test-client ─> deploy-client (vercel pull → build → deploy --prebuilt --prod)
```

Both deploy jobs require **both** test jobs, so a failing test on either side
blocks the whole release. Pull requests run the tests only.

Other workflows:

- `keep-warm.yml` — cron `*/10`, pings `/health`. Also runnable manually.
- `seed-database.yml` — manual only, requires typing `WIPE AND SEED`. Resets the
  database to the demo dataset.

## Seeding demo data

Locally, against the production database:

```bash
cd api
MONGO_URI="<atlas-uri>" npm run seed
```

Or run the **Seed database** workflow from the GitHub Actions tab.

The seed wipes every collection, then creates 1 workspace, 6 projects,
18 sprints, ~86 tasks (with subtasks, a dependency, checklists, labels),
40 comments, 80 activity entries and 10 notifications.

Sign in with:

```
Email:    sachinthachamindu26@gmail.com
Password: 12345678
```

Three placeholder users appear in the Members list; they are not for logging in.

## Interview-day checklist

Roughly 15 minutes before:

1. GitHub → Actions → **Keep API warm** → *Run workflow*. Wait for the green tick.
2. Open `https://wms-api-sachintha.azurewebsites.net/health` — expect
   `{"status":"ok","database":"connected",…}`.
3. Open the Vercel URL and sign in. The first load after a cold start can take
   ~40 s; after the warm-up it is immediate.
4. Optional: run the **Seed database** workflow for a clean dataset.

If the API returns **403** on every route, the daily 60-CPU-minute quota is
spent; it resets at 00:00 UTC (05:30 IST / 05:30 Sri Lanka time). There is no
way to reset it sooner on F1 — scaling the plan to B1 temporarily is the only
workaround.

## Known gotchas hit during setup

- **Region policy.** Azure for Students refuses most regions
  (`RequestDisallowedByAzure`). East Asia works; Southeast Asia does not.
- **`az role assignment` is broken in az CLI 2.90** — every subcommand returns
  `MissingSubscription`, even read-only `list`. The underlying ARM API is fine;
  use the portal or `az rest` against
  `Microsoft.Authorization/roleAssignments` instead.
- **Oryx cannot build this API on F1.** A server-side build reports
  "Errors (0)" and then "Deployment Failed" — the 1 GB disk is exhausted by
  `npm install` with devDependencies. Keep `SCM_DO_BUILD_DURING_DEPLOYMENT=false`
  and let CI ship a prebuilt package.
- **Basic publishing credentials are disabled** on the web app, so publish-profile
  deployment does not work. The pipeline uses OIDC instead.

## Useful commands

```bash
# Live log stream
az webapp log tail -n wms-api-sachintha -g rg-workspace-mgmt

# Restart
az webapp restart -n wms-api-sachintha -g rg-workspace-mgmt

# Read current settings
az webapp config appsettings list -n wms-api-sachintha -g rg-workspace-mgmt -o table

# Free-tier CPU quota used today
az webapp show -n wms-api-sachintha -g rg-workspace-mgmt --query state -o tsv
```
