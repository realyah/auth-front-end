// Usage: definePageMeta({ middleware: ['auth', 'admin'] }) — admin-only pages.
// The API enforces this too (403); this just keeps non-admins off the page.
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (auth.user?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
