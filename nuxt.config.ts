import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (override with NUXT_API_SECRET)
    apiSecret: '',
    public: {
      // Exposed to the client (override with NUXT_PUBLIC_API_BASE)
      apiBase: 'http://localhost:4000/api',
      appName: 'Auth App',
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
