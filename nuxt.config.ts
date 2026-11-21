import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  // Client-only (SPA). The API session is an HttpOnly cookie on the API's own
  // host, which the Nuxt server can't see — so auth can only be checked in the browser.
  ssr: false,

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Exposed to the client (override with NUXT_PUBLIC_API_BASE)
      apiBase: 'http://localhost:4000/api',
      appName: 'Auth App',
      // Cloudflare Turnstile site key; leave empty when the API has no TURNSTILE_SECRET_KEY
      turnstileSiteKey: '',
    },
  },

  // Opt in to Nuxt 5 behaviour today — upgrading later is a version bump.
  future: {
    compatibilityVersion: 5,
  },
  compatibilityDate: '2026-11-20',

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
