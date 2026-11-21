/**
 * Restores the user on first load when a token cookie exists.
 * Runs after the api plugin (alphabetical order: api.ts < auth.ts).
 */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const { fetchUser } = useAuth()

  if (auth.token && !auth.user) {
    await fetchUser()
  }
})
