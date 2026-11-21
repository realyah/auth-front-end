<script setup lang="ts">
/**
 * Cloudflare Turnstile. Renders only when NUXT_PUBLIC_TURNSTILE_SITE_KEY is set
 * (matching TURNSTILE_SECRET_KEY on the API). v-model receives the token, which
 * is single-use: call `reset()` after every submit.
 */
interface Turnstile {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window { turnstile?: Turnstile }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const token = defineModel<string>({ default: '' })
const siteKey = useRuntimeConfig().public.turnstileSiteKey
const el = ref<HTMLElement>()
let widgetId: string | null = null

function loadScript() {
  if (window.turnstile) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    const script = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT_SRC, async: true })
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')))
    if (!existing) document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!siteKey || !el.value) return
  await loadScript()
  widgetId = window.turnstile!.render(el.value, {
    'sitekey': siteKey,
    'callback': (value: string) => (token.value = value),
    'expired-callback': () => (token.value = ''),
    'error-callback': () => (token.value = ''),
  })
})

onBeforeUnmount(() => {
  if (widgetId) window.turnstile?.remove(widgetId)
})

function reset() {
  token.value = ''
  if (widgetId) window.turnstile?.reset(widgetId)
}

defineExpose({ reset, enabled: !!siteKey })
</script>

<template>
  <div
    v-if="siteKey"
    ref="el"
  />
</template>
