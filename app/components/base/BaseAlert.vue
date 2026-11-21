<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'error' | 'success' | 'info'
}>(), {
  variant: 'error',
})

const styles = {
  error: 'bg-red-50 text-red-700 ring-red-200',
  success: 'bg-green-50 text-green-700 ring-green-200',
  info: 'bg-brand-50 text-brand-700 ring-brand-100',
}
</script>

<template>
  <div
    role="alert"
    class="rounded-lg px-4 py-3 text-sm ring-1 ring-inset"
    :class="styles[variant]"
  >
    <slot />
  </div>
</template>
