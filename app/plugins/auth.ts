/**
 * On app start: get a CSRF token, then ask the API whether the session cookie
 * is still logged in (GET /auth/session: 200 = yes, 401 = show login).
 * Runs after the api plugin (alphabetical order: api.ts < auth.ts).
 */
export default defineNuxtPlugin(async () => {
  const { restoreSession } = useAuth()
  await restoreSession()
})
