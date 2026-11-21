<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Profile', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8">
    <h1 class="text-2xl font-bold">
      Your profile
    </h1>

    <section class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
      <h2 class="mb-4 font-semibold">
        Profile picture
      </h2>
      <ProfileAvatarUploader />
    </section>

    <section class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
      <h2 class="mb-4 font-semibold">
        Player details
      </h2>
      <ProfileForm />
    </section>
  </div>
</template>
