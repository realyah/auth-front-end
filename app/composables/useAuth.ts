/**
 * Auth actions. State lives in the Pinia store; this composable
 * owns the side-effects (API calls, navigation).
 *
 * Endpoints (see Auth API guide):
 *   POST /auth/register  → creates the account, no token
 *   POST /auth/login     → returns { token, user }
 *   GET  /auth/profile   → current user (needs token)
 * There is no logout endpoint — logging out = deleting the token.
 */
export function useAuth() {
  const store = useAuthStore()
  const { $api } = useNuxtApp()
  const { user, isAuthenticated } = storeToRefs(store)

  async function signIn(payload: LoginPayload) {
    const res = await $api<LoginResponse>('/auth/login', { method: 'POST', body: payload })
    store.setSession(res.token, res.user)
    // Login only returns id + username; load the full profile.
    await fetchUser()
  }

  async function login(payload: LoginPayload) {
    await signIn(payload)
    await navigateTo(safeRedirect(useRoute().query.redirect))
  }

  async function register(payload: RegisterPayload) {
    await $api<RegisterResponse>('/auth/register', { method: 'POST', body: payload })
    // Register doesn't return a token — log in with the same credentials.
    await signIn(payload)
    await navigateTo('/dashboard')
  }

  async function fetchUser() {
    try {
      const res = await $api<ProfileResponse>('/auth/profile')
      store.setUser(res.user)
    }
    catch {
      store.clearSession()
    }
  }

  async function logout() {
    store.clearSession()
    await navigateTo('/auth/login')
  }

  return { user, isAuthenticated, login, register, fetchUser, logout }
}
