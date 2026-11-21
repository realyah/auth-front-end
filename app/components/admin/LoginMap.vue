<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import type { LayerGroup, Map as LeafletMap } from 'leaflet'

/**
 * Leaflet + OpenStreetMap map of login attempts.
 * Green = successful, red = failed; each pin has a circle showing its accuracy.
 * Events without a location (lat/lng null) are skipped, so the same component
 * works for the admin map and a user's own login activity.
 * Popups are built with textContent (never innerHTML) — event fields are user data.
 */
const props = withDefaults(defineProps<{
  events: LoginEvent[]
  /** Hide the username in popups (e.g. on the user's own page). */
  showUsername?: boolean
  height?: string
}>(), {
  showUsername: true,
  height: '600px',
})

const located = computed(() =>
  props.events.filter((e): e is LocatedLoginEvent => e.lat != null && e.lng != null),
)

const COLORS = { success: '#16a34a', failed: '#dc2626' }

const el = ref<HTMLElement>()
let L: typeof import('leaflet') | null = null
let map: LeafletMap | null = null
let layer: LayerGroup | null = null

function popupFor(event: LocatedLoginEvent) {
  const root = document.createElement('div')
  root.style.minWidth = '180px'

  if (props.showUsername) {
    const title = document.createElement('strong')
    title.textContent = event.username ?? 'Unknown user'
    root.appendChild(title)
  }

  const rows: [string, string][] = [
    ['Result', event.success ? 'Signed in' : 'Failed attempt'],
    ['When', new Date(event.createdAt).toLocaleString()],
    ['Place', [event.city, event.country].filter(Boolean).join(', ') || '—'],
    ['IP', event.ip ?? '—'],
    ['Source', event.source === 'gps' ? 'Browser GPS' : 'IP lookup'],
    ['Accuracy', event.accuracyM != null ? `± ${formatDistance(event.accuracyM)}` : '—'],
  ]
  for (const [label, value] of rows) {
    const row = document.createElement('div')
    const name = document.createElement('span')
    name.style.color = '#6b7280'
    name.textContent = `${label}: `
    const text = document.createElement('span')
    text.textContent = value
    row.append(name, text)
    root.appendChild(row)
  }
  return root
}

function formatDistance(metres: number) {
  return metres >= 1000 ? `${Math.round(metres / 100) / 10} km` : `${Math.round(metres)} m`
}

function draw() {
  if (!L || !map || !layer) return
  layer.clearLayers()

  // Oldest first so the newest pins sit on top.
  for (const event of [...located.value].reverse()) {
    const color = event.success ? COLORS.success : COLORS.failed
    const latLng: [number, number] = [event.lat, event.lng]

    if (event.accuracyM) {
      L.circle(latLng, {
        radius: event.accuracyM,
        color,
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(layer)
    }
    L.circleMarker(latLng, {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: color,
      fillOpacity: 1,
    })
      .bindPopup(() => popupFor(event))
      .addTo(layer)
  }

  if (located.value.length) {
    const bounds = L.latLngBounds(located.value.map(e => [e.lat, e.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }
  else {
    map.setView([20, 0], 2)
  }
}

/** Center the map on one event and open its popup (used by the table). */
function focus(event: LoginEvent) {
  if (!map || event.lat == null || event.lng == null) return
  map.setView([event.lat, event.lng], Math.max(map.getZoom(), 11))
  layer?.eachLayer((l) => {
    if ('getLatLng' in l && 'openPopup' in l) {
      const { lat, lng } = (l as import('leaflet').CircleMarker).getLatLng()
      if (lat === event.lat && lng === event.lng) (l as import('leaflet').CircleMarker).openPopup()
    }
  })
}
defineExpose({ focus })

onMounted(async () => {
  L = await import('leaflet')
  if (!el.value) return
  map = L.map(el.value, { worldCopyJump: true }).setView([20, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)
  layer = L.layerGroup().addTo(map)
  draw()
})

watch(located, draw)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div
    ref="el"
    class="w-full overflow-hidden rounded-2xl ring-1 ring-gray-200"
    :style="{ height }"
  />
</template>
