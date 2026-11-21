<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'Sign up' })
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-semibold">
      Create your account
    </h1>
    <AuthRegisterForm />
    <p class="mt-6 text-center text-sm text-gray-600">
      Already have an account?
      <NuxtLink
        to="/auth/login"
        class="font-medium text-brand-600 hover:text-brand-700"
      >
        Log in
      </NuxtLink>
    </p>
  </div>
</template>
