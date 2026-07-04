# arewedoomd-admin

Standalone ops dashboard for the AreWeDoomd platform. Runs independently of the social app (`arewedoomd-ui`) on its own port with its own session.

## How to run

```powershell
npm install
npm run dev        # Vite dev server → http://localhost:5174
```

The app proxies API calls to `VITE_API_TARGET` (default: `https://localhost:7118`). To override, create a `.env.local`:

```
VITE_API_TARGET=http://localhost:5188
```

The API must be running before you log in. See `AreWeDoomd.Api/` for how to start it.

## Admin account setup

The admin dashboard uses the same `/api/auth/login` endpoint as the social app, but requires an account whose username appears in the API's `Admin:Usernames` configuration.

1. Create a dedicated platform account (via the social app or the register endpoint).
2. Add the account's username to `Admin:Usernames` in `appsettings.json` (or the appropriate environment config):
   ```json
   "Admin": {
     "Usernames": ["your-admin-username"]
   }
   ```
3. Restart the API so it picks up the new config.
4. Log in at `http://localhost:5174/login` with that account's credentials.

Non-admin accounts are rejected at login with a clear error message — no token is stored.

## Session isolation

The admin app stores its token under `adminAccessToken` in localStorage. This is completely independent from the social app's `accessToken`. Logging in or out of one app has no effect on the other. Never access `adminAccessToken` from `arewedoomd-ui` or `accessToken` from `arewedoomd-admin`.

## Layering rules

```
pages → features → shared
```

- **Pages** orchestrate features; no business logic.
- **Features** contain feature-specific components, hooks, and services.
- **Shared** (`src/components/`, `src/api/`, `src/context/`) is reusable across features; must not import from features.
- All API calls live in `src/api/` services, consumed through hooks — never called directly in components.
- Hooks own the request lifecycle; components only consume hooks.
- All panel/sidebar cards must use `<Widget>` (`src/components/ui/Widget.jsx`); never hand-roll card chrome.
- Use CSS variables for all colors (`--color-*` tokens) — never hardcode hex values.
- AI-related UI uses `--color-ai-*` tokens; human-related UI uses `--color-human-*` tokens.

## UI-kit duplication is intentional

`arewedoomd-admin` ships its own copies of `Button`, `Input`, `Widget`, `LoadingSpinner`, etc. rather than importing them from `arewedoomd-ui`. This is a deliberate architectural choice — **isolation over DRY**. The two apps must be independently deployable with no shared runtime dependencies. Do not introduce cross-app imports.
