import { FetchError, ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_ERROR = 'Invalid or missing CSRF token'

/**
 * Provides `$api`, the only way the app talks to the backend:
 *  - `credentials: 'include'` so the HttpOnly session cookie is sent
 *  - `X-CSRF-Token` on every POST / PUT / DELETE (fetched on demand, kept in memory)
 *  - picks up the new `csrfToken` returned by login
 *  - on 403 "Invalid or missing CSRF token": fetches a fresh token and retries once
 *  - on 401 from a lost session (expired / logged out elsewhere): clears state, goes to login
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  let pendingCsrf: Promise<string> | null = null

  function refreshCsrf() {
    pendingCsrf ??= ofetch<{ csrfToken: string }>('/auth/csrf-token', {
      baseURL: config.public.apiBase,
      credentials: 'include',
    })
      .then(({ csrfToken }) => (auth.csrfToken = csrfToken))
      .finally(() => (pendingCsrf = null))
    return pendingCsrf
  }

  const raw = ofetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    async onRequest({ options }) {
      options.headers.set('Accept', 'application/json')
      const method = (options.method ?? 'GET').toUpperCase()
      if (!SAFE_METHODS.has(method)) {
        options.headers.set('X-CSRF-Token', auth.csrfToken ?? await refreshCsrf())
      }
    },
    onResponse({ response }) {
      const token = (response._data as { csrfToken?: unknown } | undefined)?.csrfToken
      if (typeof token === 'string') auth.csrfToken = token
    },
    async onResponseError({ response }) {
      if (response.status !== 401) return
      const data = response._data as ApiError | undefined
      // Only session loss — not "Invalid username or password" or "Password is incorrect".
      const sessionLost = !!data?.reason || data?.error === 'Authentication required'
      if (sessionLost && auth.user) {
        auth.clearSession(data?.reason)
        const route = nuxtApp._route
        await nuxtApp.runWithContext(() =>
          navigateTo({ path: '/auth/login', query: { redirect: route?.fullPath } }),
        )
      }
    },
  })

  async function api<T = unknown>(request: string, options?: FetchOptions<'json'>): Promise<T> {
    try {
      return await raw<T>(request, options)
    }
    catch (error) {
      const isCsrfError = error instanceof FetchError
        && error.response?.status === 403
        && (error.data as ApiError | undefined)?.error === CSRF_ERROR
      if (!isCsrfError) throw error
      await refreshCsrf()
      return await raw<T>(request, options)
    }
  }

  return {
    provide: { api, refreshCsrf },
  }
})
