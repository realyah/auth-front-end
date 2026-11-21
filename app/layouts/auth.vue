<script setup lang="ts">
const { public: { appName } } = useRuntimeConfig()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <NuxtLink
        to="/"
        class="mb-8 block text-center text-2xl font-bold text-brand-600"
      >
        {{ appName }}
      </NuxtLink>
      <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <slot />
      </div>
    </div>
  </div>
</template>
