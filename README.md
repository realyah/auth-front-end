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
  pages/                  File-based routes (/, /dashboard, /auth/*)
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

- Token stored in an `auth_token` cookie (SSR-safe, 7 days); user kept in the Pinia `auth` store.
- `$api` (`app/plugins/api.ts`) adds `Authorization: Bearer <token>`; a 401 on an authenticated call clears the session and redirects to login.
- `POST /auth/register` (username 3–30, password ≥ 6) → then `POST /auth/login` automatically.
- `POST /auth/login` → `{ token, user }`; failures show `FAILED_PASSWORD` (tries left) / `LOCKED` (30 min).
- `GET /auth/profile` restores the user on page load.
- No logout endpoint — logout just deletes the token.
- Todos: `useTodosApi()`; All About Me: `useAboutMeApi()`.
