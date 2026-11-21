/**
 * The logged-in user's own login attempts (successful and failed), newest first.
 *   GET /auth/login-events?days&limit&success
 * Unlike the admin endpoint, attempts without a location are included (lat/lng null).
 */
export function useLoginActivity() {
  const { $api } = useNuxtApp()

  function myLoginEvents(query: MyLoginEventsQuery = {}) {
    return $api<LoginEventsResponse>('/auth/login-events', {
      query: {
        days: query.days,
        limit: query.limit,
        success: query.success === undefined ? undefined : String(query.success),
      },
    })
  }

  return { myLoginEvents }
}

/** "London, GB" — or "Unknown location" when the API couldn't place it. */
export function loginEventPlace(event: Pick<LoginEvent, 'city' | 'country' | 'lat'>) {
  const place = [event.city, event.country].filter(Boolean).join(', ')
  if (place) return place
  return event.lat == null ? 'Unknown location' : 'Location on map'
}
