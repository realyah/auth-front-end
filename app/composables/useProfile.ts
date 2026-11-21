export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024

/**
 * Player profile + avatar endpoints (all need the token).
 * Each call returns the full user, which is written back to the auth store.
 *   PUT    /auth/profile          → update details (send only changed fields)
 *   POST   /auth/profile/avatar   → multipart field `avatar` (JPEG/PNG/WebP, ≤ 2 MB)
 *   DELETE /auth/profile/avatar   → remove picture
 */
export function useProfile() {
  const store = useAuthStore()
  const { $api } = useNuxtApp()

  async function updateProfile(changes: PlayerProfileUpdate) {
    const res = await $api<ProfileUpdateResponse>('/auth/profile', { method: 'PUT', body: changes })
    store.setUser(res.user)
    return res.user
  }

  /** Returns an error message if the file can't be uploaded, '' otherwise. */
  function validateAvatar(file: File) {
    if (!AVATAR_TYPES.includes(file.type)) return 'Choose a JPEG, PNG or WebP image.'
    if (file.size > AVATAR_MAX_BYTES) return 'Image must be 2 MB or smaller.'
    return ''
  }

  async function uploadAvatar(file: File) {
    const body = new FormData()
    body.append('avatar', file)
    const res = await $api<ProfileUpdateResponse>('/auth/profile/avatar', { method: 'POST', body })
    store.setUser(res.user)
    return res.user
  }

  async function deleteAvatar() {
    const res = await $api<ProfileUpdateResponse>('/auth/profile/avatar', { method: 'DELETE' })
    store.setUser(res.user)
    return res.user
  }

  return { updateProfile, validateAvatar, uploadAvatar, deleteAvatar }
}

/**
 * Turns `avatarUrl` (/uploads/avatars/abc.png) into a full URL on the API's origin.
 * Images are public — no token needed.
 */
export function avatarSrc(user?: Pick<User, 'avatarUrl'> | null) {
  if (!user?.avatarUrl) return null
  return new URL(user.avatarUrl, useRuntimeConfig().public.apiBase).href
}

export function displayNameOf(user?: Pick<User, 'username' | 'profile'> | null) {
  return user?.profile?.displayName || user?.username || ''
}
