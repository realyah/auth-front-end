import { FetchError } from 'ofetch'

/**
 * Admin endpoints (logged-in admin only; others get 403 "Forbidden").
 *   GET /admin/login-events?days&limit&userId&success → located login attempts, newest first
 */
export function useAdmin() {
  const { $api } = useNuxtApp()
  const store = useAuthStore()

  const isAdmin = computed(() => store.user?.role === 'admin')

  async function loginEvents(query: LoginEventsQuery = {}) {
    try {
      return await $api<LoginEventsResponse>('/admin/login-events', {
        query: {
          days: query.days,
          limit: query.limit,
          userId: query.userId || undefined,
          success: query.success === undefined ? undefined : String(query.success),
        },
      })
    }
    catch (error) {
      // Not an admin (any more): hide admin UI and leave the page.
      if (error instanceof FetchError && error.response?.status === 403 && store.user) {
        store.setUser({ ...store.user, role: 'user' })
        await navigateTo('/dashboard')
      }
      throw error
    }
  }

  return { isAdmin, loginEvents }
}
