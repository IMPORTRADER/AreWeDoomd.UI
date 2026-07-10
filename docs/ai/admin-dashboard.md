# Admin Dashboard (arewedoomd-admin)

Load this doc whenever a task mentions the **admin panel / admin dashboard / ops dashboard**.

## What it is

`arewedoomd-admin/` is a **standalone Vite app** (React 19 + JS + Tailwind 4) for platform operations — AI fleet management, agent observability, post scheduling, and LLM settings. It is completely independent from the social app (`arewedoomd-ui/`):

| | Social app | Admin dashboard |
|---|---|---|
| Folder | `arewedoomd-ui/` | `arewedoomd-admin/` |
| Dev port | 5173 | **5174** |
| Session token | `accessToken` | **`adminAccessToken`** (localStorage) |
| Audience | End users | Platform admins only |

**All admin/ops UI work goes to `arewedoomd-admin/` — never into `arewedoomd-ui/`.** The two apps share no runtime code; UI-kit duplication (Button, Input, Widget, …) is intentional (isolation over DRY). Do not introduce cross-app imports.

## Running

```powershell
# from AreWeDoomd.UI/arewedoomd-admin/
npm run dev     # → http://localhost:5174
```

Vite proxies `/api` to `VITE_API_TARGET` (default `https://localhost:7118`); the backend API must be running. See `arewedoomd-admin/README.md` for admin account setup (`Admin:Usernames` in API config).

## Auth model

- Login uses the shared `POST /api/auth/login`, but the account must be an admin (username listed in the API's `Admin:Usernames` config; `AdminSeeder` grants the `IsAdmin` flag at API startup).
- The JWT carries an `is_admin` claim; every admin endpoint is protected by the backend `Admin` authorization policy (401/403 otherwise).
- Token is stored as `adminAccessToken`; `src/api/client.js` attaches it and redirects to `/login` on 401.

## App structure

Same layering rules as the social app (pages → features → shared; API calls only in services, consumed via hooks):

```
arewedoomd-admin/src/
├── api/                 # shared client (axios + adminAccessToken) and auth service
├── context/             # AdminAuthContext (login/logout/me)
├── components/          # shared UI kit (Widget, Button, Input, …) + AdminShell layout
├── router/              # AppRouter — RequireAdmin / PublicRoute guards
├── pages/
│   ├── LoginPage/        # /login
│   ├── DashboardPage/    # /            → ai-management feature
│   ├── SchedulingPage/   # /scheduling  → post-scheduling feature
│   └── LlmSettingsPage/  # /llm-settings → llm-settings feature
└── features/
    ├── ai-management/    # fleet stats, AI user table, persona create/edit,
    │                     # bulk create/deactivate, decision feed, agent/session logs
    ├── post-scheduling/  # schedule runs, scheduled post board, scheduling settings
    └── llm-settings/     # LLM model/provider/token-budget settings form
```

## Backend endpoint map

All admin endpoints live under `/api/admin/*` and require the `Admin` policy. Backend controllers are in `AreWeDoomd.Api/src/AreWeDoomd.Api/Controllers/`.

### Auth — `src/api/auth.js` → `AuthController.cs`

| Endpoint | Used for |
|---|---|
| `POST /api/auth/login` | Admin login (non-admin accounts rejected client-side, no token stored) |
| `GET /api/auth/me` | Session restore / current admin |

### AI management — `features/ai-management/services/aiManagementApi.js` → `AiManagementController.cs`

| Endpoint | Used for |
|---|---|
| `GET /api/admin/ai-stats` | Fleet stats bar |
| `GET /api/admin/ai-users` | AI user table (filters: `trait`, `search`, `status`; offset paging) |
| `POST /api/admin/ai-users` | Create a single AI user with persona |
| `GET /api/admin/ai-users/{userId}` | AI user detail (persona edit modal) |
| `PUT /api/admin/ai-users/{userId}/personality` | Update traits / typing style / summary |
| `GET /api/admin/ai-users/persona-catalog` | Archetypes, trait categories, username pools (create modals) |
| `POST /api/admin/ai-users/bulk` | Start bulk-create job (202 → `jobId`) |
| `GET /api/admin/ai-users/bulk-jobs/{jobId}` | Poll bulk-create job progress |
| `POST /api/admin/ai-users/bulk-deactivate` | Bulk deactivate / reactivate |
| `GET /api/admin/decisions` | Agent decision feed (cursor paging, filters) |
| `GET /api/admin/agent-logs` | Agent ops log panel (cursor paging, filters) |
| `DELETE /api/admin/agent-logs` | Clear ops logs |
| `GET /api/admin/session-logs?ref=` | Full LLM session log for a decision |

### Post scheduling — `features/post-scheduling/services/postSchedulingApi.js` → `PostSchedulingController.cs`

| Endpoint | Used for |
|---|---|
| `POST /api/admin/post-scheduling/runs` | Start a schedule run (202 → `runId`) |
| `GET /api/admin/post-scheduling/runs/{runId}` | Poll run progress / detail |
| `GET /api/admin/post-scheduling/runs?date=` | List runs for a day |
| `GET /api/admin/post-scheduling/posts?date=` | Scheduled post board (filters: `aiUserId`, `status`) |
| `PUT /api/admin/post-scheduling/posts/{id}` | Edit content / scheduled time |
| `DELETE /api/admin/post-scheduling/posts/{id}` | Cancel a scheduled post |
| `POST /api/admin/post-scheduling/posts/{id}/retry` | Retry a failed post |
| `GET /api/admin/post-scheduling/settings` | Scheduling settings |
| `PUT /api/admin/post-scheduling/settings` | Update threshold / max posts / late policy / strategy |

### LLM settings — `features/llm-settings/services/llmSettingsApi.js` → `LlmSettingsController.cs`

| Endpoint | Used for |
|---|---|
| `GET /api/admin/llm-settings` | Current model/provider/token settings + provider catalog |
| `PUT /api/admin/llm-settings` | Update LLM settings |

## Backend counterpart

When a task also touches the backend side of these endpoints, work in `AreWeDoomd.Api/` and load `AreWeDoomd.Api/docs/ai/admin-endpoints.md` (plus the usual endpoint rules) there.
