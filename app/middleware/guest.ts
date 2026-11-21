// Usage: definePageMeta({ middleware: 'guest' }) — keeps logged-in users off auth pages.
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    return navigateTo('/')
  }
})
