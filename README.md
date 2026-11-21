# auth-front-end

Frontend for the Auth API: sign up, log in, edit your player profile and picture, and (for admins) see where login attempts came from on a map.

**Stack:** Nuxt 4 (running with `compatibilityVersion: 5`) · Vue 3 · Tailwind CSS v4 · Pinia · TypeScript · ESLint · Leaflet

The app runs **client-only** (`ssr: false`). The API keeps the login in an HttpOnly cookie on its own host, which the Nuxt server can't read, so login state can only be checked in the browser.

## Quick start

You need the backend (Auth API) running first, by default on `http://localhost:4000`.

```bash
cp .env.example .env
npm install
npm run dev
```

Then open **`http://localhost:3000`**. Use `localhost`, not `http://[::1]:3000`, even though Nuxt prints that address. The browser treats them as different sites and won't send the login cookie to the API from `[::1]`.

If port 3000 is taken, Nuxt picks 3001. That's fine as long as the backend allows it (see [Backend setup](#backend-setup)).

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:4000/api` | Base URL of the API |
| `NUXT_PUBLIC_APP_NAME` | `Auth App` | Name shown in the header and page titles |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | *(empty)* | Cloudflare Turnstile site key. Set it only when the API has `TURNSTILE_SECRET_KEY`; empty means no CAPTCHA. |

## Backend setup

These go in the **backend's** `.env`, not this project's:

| Setting | Why |
| --- | --- |
| `CORS_ORIGIN=http://localhost:3000,http://localhost:3001` | Every frontend address must be listed exactly. `*` isn't allowed. Without it, every request fails with "Unable to reach the server". |
| `SESSION_SECRET=<long random string>` | Without it the API picks a random one at each start. |
| `REDIS_URL=...` *(optional in development)* | Without Redis, sessions live in memory, so every backend restart logs everyone out. |

To make a user an admin, run this in the **backend** folder:

```bash
npm run make-admin -- <username>            # grant admin
npm run make-admin -- <username> --revoke   # back to a normal user
```

The space after `--` is required. The user sees the Admin link after reloading the page.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run generate` | Static build |
| `npm run preview` | Preview the production build |
| `npm run lint` / `lint:fix` | ESLint (flat config) |
| `npm run typecheck` | Type check (vue-tsc) |

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/` | Everyone | Home page |
| `/auth/login` | Logged out | Log in, with an optional "Share my location" box |
| `/auth/register` | Logged out | Create an account, then log straight in |
| `/profile` | Logged in | Where you land after login. Upload, change or remove your picture; edit your player details. |
| `/dashboard` | Logged in | Read-only view of all your player details and last login |
| `/admin/logins` | Admins | Map and table of login attempts, filterable by time, result and user |

Logged-in users who open the login or sign-up page are sent to `/profile`. Logged-out users who open a protected page are sent to login, then back to that page afterwards.

## How it talks to the API

All requests go through `$api` (`app/plugins/api.ts`). Don't call `fetch` or `$fetch` directly. `$api`:

- sends the session cookie (`credentials: 'include'`). No token is ever stored in JavaScript or `localStorage`.
- adds an `X-CSRF-Token` header to every POST, PUT and DELETE. The token is fetched from `GET /auth/csrf-token` when the app loads, kept in memory, and replaced by the new token that login returns.
- on 403 "Invalid or missing CSRF token", fetches a fresh token and retries the request once.
- on a 401 caused by a lost session, clears the login state and goes to the login page. A 401 from a wrong password doesn't trigger this.

```ts
const { $api } = useNuxtApp()
const res = await $api<ProfileResponse>('/auth/profile')
await $api('/auth/profile', { method: 'PUT', body: { team: 'Reds' } })
```

### Login and session

| Step | Endpoint | Notes |
| --- | --- | --- |
| App start | `GET /auth/session` | 200 means logged in (then `GET /auth/profile`); 401 means show login. A 401 here in DevTools is normal when logged out. |
| Register | `POST /auth/register` | Username 3–30 characters (letters, numbers, `.`, `_`, `-`); password 12–128 characters. |
| Login | `POST /auth/login` | Every failure says "Invalid username or password". After 10 tries in 15 minutes the API returns 429. |
| Logout | `POST /auth/logout` | Destroys the session on the server. |
| Expiry | any request → 401 | `reason: IDLE_TIMEOUT` (30 min idle) or `REAUTH_REQUIRED` (8 h after login). The login page explains which. |

### Location at login (optional)

The login form has an **unticked** "Share my location to protect my account" box. When ticked, `getGeo()` (`app/utils/geo.ts`) asks the browser for its position, and the result is sent as `geo: { lat, lng, accuracy }` in the login body.

Location never blocks login. If the user says no, the browser fails, or it takes longer than about 8 seconds, the login goes ahead without it and the API uses the IP address. The browser only allows location on HTTPS or `localhost`.

### Admin login map

`/admin/logins` loads `GET /admin/login-events` and shows it on a Leaflet + OpenStreetMap map (`app/components/admin/LoginMap.vue`):

- green pins are successful logins, red pins are failed ones, and each pin has a circle showing how accurate its location is
- popups are built with `textContent`, never `innerHTML`
- only attempts with a known location appear. A login from `localhost` (`127.0.0.1`) has no IP location, so in development only logins with GPS shared show up.

The Admin link and page appear only when the profile's `role` is `admin`. The API also checks: a 403 "Forbidden" hides the admin UI and leaves the page.

If you add a Content Security Policy, allow `img-src https://*.tile.openstreetmap.org` so the map tiles load.

### Errors

`useFormErrors()` turns any API error into something a form can show:

```ts
const errors = useFormErrors()
try { /* … */ }
catch (error) { errors.handle(error, ['username', 'password']) }
// errors.message.value → message for the top of the form
// errors.fields.value  → { username: '…' } shown next to each input
```

| Status | Shown as |
| --- | --- |
| 400 with `details` | Each message next to its field; anything else at the top |
| 401 / 403 / 404 / 409 / 429 | The API's `error` message |
| 413 | "That request is too large." |
| 5xx | "Something went wrong. Please try again." |
| No response | "Unable to reach the server." Usually CORS: check `CORS_ORIGIN` on the backend. |

## Project structure

```
app/
  assets/css/main.css       Tailwind entry + design tokens
  components/
    base/                   BaseButton, BaseInput, BaseAlert, BaseAvatar
    layout/                 AppHeader
    auth/                   LoginForm, RegisterForm, CaptchaWidget (Turnstile)
    profile/                AvatarUploader, ProfileForm
    admin/                  LoginMap (Leaflet)
  composables/
    useAuth.ts              login, register, logout, restoreSession, fetchUser
    useProfile.ts           update details, upload/delete picture, avatarSrc()
    useAdmin.ts             isAdmin, loginEvents()
    useFormErrors.ts        API errors → form messages
    useTodosApi.ts          Todo endpoints (no UI yet)
    useAboutMeApi.ts        All About Me endpoints (no UI yet)
  layouts/                  default.vue, auth.vue
  middleware/               auth (logged in), guest (logged out), admin (role)
  pages/                    see Pages above
  plugins/
    api.ts                  $api: cookie, CSRF, retry, 401 handling
    auth.ts                 checks the session when the app starts
  stores/auth.ts            Pinia: user, CSRF token, login-page notice (memory only)
  utils/                    validators, getGeo, safeRedirect (auto-imported)
shared/types/auth.ts        API request/response types
```

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| "Unable to reach the server" | The backend's `CORS_ORIGIN` doesn't include the address in your browser bar. Add it and restart the backend. Also check the backend is running. |
| Logged out after every reload | You're on `[::1]` instead of `localhost`, or the backend restarted (in-memory sessions are wiped on each restart unless `REDIS_URL` is set). |
| 401 on `/api/auth/session` in DevTools | Normal when logged out: that's how the app finds out. |
| No Admin link | The user isn't an admin. Run `make-admin` in the backend, then reload. |
| Map is empty | No located attempts in that time range. Locally, tick "Share my location" when logging in. |
| `npm run make-admin` shows npm's help | Run it in the backend folder, with a space after `--`: `npm run make-admin -- yah`. |
