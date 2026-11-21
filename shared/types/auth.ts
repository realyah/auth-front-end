// Types shared between app/ and server/ (auto-imported in both).
// Shapes follow the "Auth API — Frontend Integration Guide".

export type AuthStatus = 'SUCCESS' | 'FAILED_PASSWORD' | 'LOCKED'

export interface LoginDetails {
  browser?: string
  os?: string
  deviceType?: string
  ipAddress?: string
  loginStatus?: AuthStatus
  loggedInAt?: string
}

/** Player details. `null` = not set. Send `null` or "" to clear one. */
export interface PlayerProfile {
  displayName: string | null
  bio: string | null
  country: string | null
  dateOfBirth: string | null
  gender: string | null
  position: string | null
  team: string | null
}

export type PlayerProfileUpdate = Partial<PlayerProfile>

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  username: string
  /** From GET /auth/profile — show admin links only for 'admin'. */
  role?: UserRole
  /** Path like /uploads/avatars/abc.png — prefix with the API origin (see avatarSrc). */
  avatarUrl?: string | null
  profile?: PlayerProfile
  createdAt?: string
  updatedAt?: string
  login_status?: AuthStatus
  userAgentString?: LoginDetails
}

/** Browser GPS shared at login (optional). Malformed values are ignored by the server. */
export interface LoginGeo {
  lat: number
  lng: number
  /** metres */
  accuracy: number
}

export interface LoginPayload {
  username: string
  password: string
  geo?: LoginGeo
  /** Cloudflare Turnstile token — only when CAPTCHA is turned on. */
  captchaToken?: string
}

export type RegisterPayload = Omit<LoginPayload, 'geo'>

/** POST /auth/register → 201 (no session — call login next) */
export interface RegisterResponse {
  message: string
  user: User
}

/** POST /auth/login → 200 */
export interface LoginResponse {
  message: string
  status: 'SUCCESS'
  csrfToken: string
  user: Pick<User, 'id' | 'username'>
  userAgent: LoginDetails
}

/** GET /auth/session → 200 (401 = not logged in) */
export interface SessionResponse {
  authenticated: true
  user: Pick<User, 'id' | 'username'>
  idleExpiresAt: string
  reauthRequiredAt: string
}

/** GET /auth/profile → 200 */
export interface ProfileResponse {
  message: string
  user: User
}

/** PUT /auth/profile, POST|DELETE /auth/profile/avatar → 200 */
export interface ProfileUpdateResponse {
  message: string
  avatarUrl?: string | null
  user: User
}

/** Why a session ended (sent with a 401). */
export type SessionEndReason = 'IDLE_TIMEOUT' | 'REAUTH_REQUIRED'

/** Every error response: `{ error }`, plus `details` on 400 validation errors. */
export interface ApiError {
  error: string
  reason?: SessionEndReason
  details?: { field: string, message: string }[]
}

// ── Todos ────────────────────────────────────────────────

export type TodoStatus = 'created' | 'done' | 'deleted'

export interface Todo {
  id: string
  username: string
  title: string
  description: string | null
  status: TodoStatus
  createdAt: string
  updatedAt: string
}

export interface TodoUpdate {
  title?: string
  description?: string | null
  status?: TodoStatus
}

// ── All About Me ─────────────────────────────────────────

export interface AboutMeFields {
  name?: string
  birthday?: string
  status?: string
  from?: string
  title?: string
  favoriteColor?: string
  favoriteSong?: string
  favoriteMovie?: string
  favoriteFood?: string
  myHobbies?: string
  wordsThatDescribeMe?: string
  myDreams?: string
  thingsILove?: string
  funFactsAboutMe?: string
  myMoto?: string
}

export interface AboutMe extends AboutMeFields {
  id: string
  username: string
  createdAt: string
  updatedAt: string
}

// ── Admin ────────────────────────────────────────────────

/** One login attempt with a location (GPS if shared, otherwise IP lookup). */
export interface LoginEvent {
  id: string
  userId: string | null
  username: string | null
  success: boolean
  ip: string | null
  country: string | null
  city: string | null
  lat: number
  lng: number
  accuracyM: number | null
  source: 'gps' | 'ip'
  createdAt: string
}

/** GET /admin/login-events query: days 1–365 (30), limit 1–5000 (1000). */
export interface LoginEventsQuery {
  days?: number
  limit?: number
  userId?: string
  success?: boolean
}

export interface LoginEventsResponse {
  count: number
  events: LoginEvent[]
}
