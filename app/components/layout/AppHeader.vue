<script setup lang="ts">
const { public: { appName } } = useRuntimeConfig()
const { user, isAuthenticated, logout } = useAuth()
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <NuxtLink
        to="/"
        class="text-lg font-bold text-brand-600"
      >
        {{ appName }}
      </NuxtLink>

      <nav class="flex items-center gap-3">
        <template v-if="isAuthenticated">
          <span class="hidden text-sm text-gray-600 sm:inline">{{ user?.username }}</span>
          <BaseButton
            to="/dashboard"
            variant="ghost"
            size="sm"
          >
            Dashboard
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            @click="logout"
          >
            Log out
          </BaseButton>
        </template>
        <template v-else>
          <BaseButton
            to="/auth/login"
            variant="ghost"
            size="sm"
          >
            Log in
          </BaseButton>
          <BaseButton
            to="/auth/register"
            size="sm"
          >
            Sign up
          </BaseButton>
        </template>
      </nav>
    </div>
  </header>
</template>
