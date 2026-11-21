import { FetchError } from 'ofetch'

/**
 * Auth actions. State lives in the Pinia store; this composable
 * owns the side-effects (API calls, navigation).
 *
 *   GET  /auth/csrf-token  → token for X-CSRF-Token (on app load + after logout)
 *   GET  /auth/session     → 200 logged in, 401 not
 *   POST /auth/register    → creates the account (no session — log in next)
 *   POST /auth/login       → starts the session, returns a new csrfToken
 *   POST /auth/logout      → destroys the session cookie
 *   GET  /auth/profile     → full user
 */
export function useAuth() {
  const store = useAuthStore()
  const { $api, $refreshCsrf } = useNuxtApp()
  const { user, isAuthenticated } = storeToRefs(store)

  async function fetchUser() {
    const res = await $api<ProfileResponse>('/auth/profile')
    store.setUser(res.user)
  }

  async function restoreSession() {
    try {
      await $refreshCsrf()
      await $api<SessionResponse>('/auth/session')
      await fetchUser()
    }
    catch {
      store.setUser(null)
    }
  }

  async function goAfterLogin() {
    await navigateTo(safeRedirect(useRoute().query.redirect))
  }

  async function login(payload: LoginPayload) {
    await $api<LoginResponse>('/auth/login', { method: 'POST', body: payload })
    store.notice = ''
    await fetchUser()
    await goAfterLogin()
  }

  async function register(payload: RegisterPayload) {
    await $api<RegisterResponse>('/auth/register', { method: 'POST', body: payload })
    // Log straight in. The CAPTCHA token is single-use, so if CAPTCHA is on this login is refused — send the user to login.
    try {
      await login({ username: payload.username, password: payload.password })
    }
    catch (error) {
      if (error instanceof FetchError && error.response?.status === 400) {
        store.notice = 'Account created — please log in.'
        await navigateTo('/auth/login')
        return
      }
      throw error
    }
  }

  async function logout() {
    try {
      await $api('/auth/logout', { method: 'POST' })
    }
    catch {
      // Clear locally regardless.
    }
    store.clearSession()
    await navigateTo('/auth/login')
  }

  return { user, isAuthenticated, restoreSession, fetchUser, login, register, logout }
}
