<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <p class="text-6xl font-bold text-brand-600">
      {{ error.statusCode }}
    </p>
    <p class="text-gray-600">
      {{ error.statusMessage || error.message }}
    </p>
    <BaseButton @click="clearError({ redirect: '/' })">
      Go home
    </BaseButton>
  </div>
</template>
