/**
 * Asks the browser for the current position, for the optional
 * "share my location" login step. Never throws and never blocks login:
 * resolves `undefined` if unsupported, denied, failed or too slow.
 * Works only on HTTPS or localhost.
 */
export function getGeo(timeoutMs = 8000): Promise<LoginGeo | undefined> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(undefined)

  return new Promise((resolve) => {
    // Some browsers never call back if the permission prompt is ignored.
    const fallback = setTimeout(() => resolve(undefined), timeoutMs + 1000)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        clearTimeout(fallback)
        resolve({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy })
      },
      () => {
        clearTimeout(fallback)
        resolve(undefined)
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}
