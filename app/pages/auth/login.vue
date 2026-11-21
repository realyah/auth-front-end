<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'Log in' })
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-semibold">
      Log in to your account
    </h1>
    <AuthLoginForm />
    <p class="mt-6 text-center text-sm text-gray-600">
      No account?
      <NuxtLink
        to="/auth/register"
        class="font-medium text-brand-600 hover:text-brand-700"
      >
        Sign up
      </NuxtLink>
    </p>
  </div>
</template>
