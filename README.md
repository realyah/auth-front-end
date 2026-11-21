# auth-front-end

Nuxt 4 (running with `compatibilityVersion: 5`) · Tailwind CSS v4 · Pinia · TypeScript · ESLint

## Setup

```bash
cp .env.example .env   # set NUXT_PUBLIC_API_BASE to your backend
npm install
npm run dev            # http://localhost:3000
```

| Script              | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Dev server with HMR        |
| `npm run build`     | Production build           |
| `npm run preview`   | Preview production build   |
| `npm run lint(:fix)`| ESLint (flat config)       |
| `npm run typecheck` | vue-tsc type check         |

## Structure

```
app/
  assets/css/main.css     Tailwind entry + @theme design tokens
  components/
    base/                 Generic UI (BaseButton, BaseInput, BaseAlert)
    layout/               App chrome (<LayoutAppHeader>)
    auth/                 Auth forms (<AuthLoginForm>, ...)
  composables/            useAuth, useApi, useFormErrors
  layouts/                default.vue, auth.vue
  middleware/             auth (protected), guest (auth pages)
  pages/                  File-based routes (/, /dashboard, /profile, /auth/*)
  plugins/                api.ts ($api fetch instance), auth.ts (session restore)
  stores/                 Pinia stores (auth)
  types/                  Client-only types
  utils/                  Auto-imported helpers (validators, safeRedirect)
  app.vue · error.vue
server/                   Nitro server routes (api/, utils/)
shared/types/             Types shared by app/ and server/
public/                   Static files
```

## Auth flow

Backend: Auth API (see "Auth API — Frontend Integration Guide"), default `http://localhost:4000/api`.
The app runs client-only (`ssr: false`) because the session cookie belongs to the API host.

- **Session**: HttpOnly cookie set by the API. Every request uses `credentials: 'include'`; no token is stored in JS.
- **CSRF**: `GET /auth/csrf-token` on load, kept in memory (Pinia), sent as `X-CSRF-Token` on POST/PUT/DELETE.
  Login responses replace it; a 403 "Invalid or missing CSRF token" refetches and retries once (`app/plugins/api.ts`).
- **Startup**: `GET /auth/session` → 200 logged in (then `GET /auth/profile`), 401 → login.
- **Login**: `POST /auth/login` → session cookie + new `csrfToken`. All failures: "Invalid username or password"; 429 after 10 tries / 15 min.
- **Register**: username 3–30 (letters, numbers, `.` `_` `-`), password 12–128; then logs in.
- **Logout**: `POST /auth/logout`.
- **Expiry**: 401 with `reason` `IDLE_TIMEOUT` (30 min) / `REAUTH_REQUIRED` (8 h) → back to login with a notice.
- **Errors**: `useFormErrors().handle(error, fields)` puts 400 `details` next to fields; 429/413/5xx get a message.
- **CAPTCHA**: set `NUXT_PUBLIC_TURNSTILE_SITE_KEY` when the API has `TURNSTILE_SECRET_KEY`.
- **CORS**: the API's `CORS_ORIGIN` must list this app's exact origin (e.g. `http://localhost:3000`).
- Player profile + avatar: `useProfile()`, page `/profile`. Todos: `useTodosApi()`; All About Me: `useAboutMeApi()`.
