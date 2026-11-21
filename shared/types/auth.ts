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

export interface User {
  id: string
  username: string
  createdAt?: string
  updatedAt?: string
  login_status?: AuthStatus
  userAgentString?: LoginDetails
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  password: string
}

/** POST /api/auth/register → 201 (no token — call login next) */
export interface RegisterResponse {
  message: string
  user: User
}

/** POST /api/auth/login → 200 */
export interface LoginResponse {
  message: string
  status: 'SUCCESS'
  token: string
  userAgent: LoginDetails
  user: Pick<User, 'id' | 'username'>
}

/** GET /api/auth/profile → 200 */
export interface ProfileResponse {
  message: string
  user: User
}

/** Every error response: `{ error }`; login errors add `status` / `remainingAttempts`. */
export interface ApiError {
  error: string
  status?: AuthStatus
  remainingAttempts?: number
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
