import type { UseFetchOptions } from 'nuxt/app'

/**
 * `useFetch` wrapper that goes through the `$api` instance
 * (baseURL + auth header + 401 handling).
 *
 * @example const { data } = await useApi<User[]>('/users')
 */
export function useApi<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {},
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch,
  })
}
