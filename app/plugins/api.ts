/**
 * Provides a pre-configured `$api` fetch instance:
 *  - baseURL from runtimeConfig.public.apiBase (e.g. http://localhost:4000/api)
 *  - `Authorization: Bearer <token>` attached automatically
 *  - On 401 for an authenticated call (expired/invalid token): clear session + go to login.
 *    A 401 from a failed login has no token attached, so it's left to the form.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      options.headers.set('Accept', 'application/json')
      if (auth.token) {
        options.headers.set('Authorization', `Bearer ${auth.token}`)
      }
    },
    async onResponseError({ response, options }) {
      const sentToken = options.headers.has('Authorization')
      if (response.status === 401 && sentToken) {
        auth.clearSession()
        await nuxtApp.runWithContext(() => navigateTo('/auth/login'))
      }
    },
  })

  return {
    provide: { api },
  }
})
