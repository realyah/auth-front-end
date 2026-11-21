export const useAuthStore = defineStore('auth', () => {
  // Cookie-backed token so it's available during SSR as well as on the client.
  // The backend never reads cookies — the token is sent as a Bearer header by $api.
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches the API's default JWT_EXPIRES_IN
    sameSite: 'lax',
    secure: !import.meta.dev,
  })

  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function setSession(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
  }

  function setUser(value: User | null) {
    user.value = value
  }

  function clearSession() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, setSession, setUser, clearSession }
})
