<script setup lang="ts">
const props = withDefaults(defineProps<{
  user?: Pick<User, 'username' | 'avatarUrl' | 'profile'> | null
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const sizes = {
  sm: 'size-8 text-sm',
  md: 'size-12 text-lg',
  lg: 'size-24 text-3xl',
}

const src = computed(() => avatarSrc(props.user))
const name = computed(() => displayNameOf(props.user))
const initial = computed(() => name.value.charAt(0).toUpperCase() || '?')
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="name"
    class="shrink-0 rounded-full object-cover ring-1 ring-gray-200"
    :class="sizes[size]"
  >
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700"
    :class="sizes[size]"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>
