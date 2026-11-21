<script setup lang="ts">
const { public: { appName } } = useRuntimeConfig()

useHead({
  titleTemplate: title => (title ? `${title} · ${appName}` : appName),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
