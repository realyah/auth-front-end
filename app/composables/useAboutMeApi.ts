import { FetchError } from 'ofetch'

/**
 * All About Me endpoints. One profile per user; `save()` creates it on first
 * call (`name` required) and updates it after that — send only changed fields.
 */
export function useAboutMeApi() {
  const { $api } = useNuxtApp()

  /** Returns `null` when the profile doesn't exist yet (404) — show an empty form. */
  async function get(): Promise<AboutMe | null> {
    try {
      const res = await $api<{ message: string, aboutMe: AboutMe }>('/allaboutme')
      return res.aboutMe
    }
    catch (error) {
      if (error instanceof FetchError && error.response?.status === 404) return null
      throw error
    }
  }

  /** Retries once on 409 (concurrent save). */
  async function save(fields: AboutMeFields): Promise<AboutMe> {
    const send = () => $api<{ message: string, aboutMe: AboutMe }>('/allaboutme', { method: 'POST', body: fields })
    try {
      return (await send()).aboutMe
    }
    catch (error) {
      if (error instanceof FetchError && error.response?.status === 409) return (await send()).aboutMe
      throw error
    }
  }

  return { get, save }
}
