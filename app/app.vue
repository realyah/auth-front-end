<script setup lang="ts">
const { public: { appName } } = useRuntimeConfig()

useHead({
  titleTemplate: title => (title ? `${title} · ${appName}` : appName),
})

// Default for every page; pages can override with their own useSeoMeta.
useSeoMeta({
  description: `${appName} — sign in to manage your player profile, todos and more.`,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
