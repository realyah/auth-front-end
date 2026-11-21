/**
 * Auth state, kept in memory only.
 * The session itself lives in an HttpOnly cookie set by the API — JavaScript
 * never sees it. The CSRF token is held here and never persisted.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const csrfToken = ref<string | null>(null)
  /** Shown once on the login page, e.g. after an idle timeout. */
  const notice = ref('')

  const isAuthenticated = computed(() => !!user.value)

  function setUser(value: User | null) {
    user.value = value
  }

  function clearSession(reason?: SessionEndReason) {
    user.value = null
    // The server destroyed the session, and its CSRF token with it.
    csrfToken.value = null
    if (reason === 'IDLE_TIMEOUT') notice.value = 'You were logged out after 30 minutes of inactivity.'
    else if (reason === 'REAUTH_REQUIRED') notice.value = 'Your session has ended. Please log in again.'
  }

  return { user, csrfToken, notice, isAuthenticated, setUser, clearSession }
})
