/**
 * Only allow same-origin relative paths as post-login redirects
 * (prevents open-redirects like ?redirect=//evil.com).
 */
export function safeRedirect(value: unknown, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback
}
