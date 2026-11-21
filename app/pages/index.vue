<script setup lang="ts">
const { public: { appName } } = useRuntimeConfig()
const { isAuthenticated } = useAuth()

useSeoMeta({ title: 'Home' })
</script>

<template>
  <section class="py-16 text-center">
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
      Welcome to {{ appName }}
    </h1>
    <p class="mx-auto mt-4 max-w-xl text-lg text-gray-600">
      Nuxt + Tailwind CSS authentication starter.
    </p>
    <div class="mt-8 flex justify-center gap-3">
      <BaseButton
        v-if="isAuthenticated"
        to="/dashboard"
        size="lg"
      >
        Go to dashboard
      </BaseButton>
      <template v-else>
        <BaseButton
          to="/auth/register"
          size="lg"
        >
          Get started
        </BaseButton>
        <BaseButton
          to="/auth/login"
          variant="secondary"
          size="lg"
        >
          Log in
        </BaseButton>
      </template>
    </div>
  </section>
</template>
