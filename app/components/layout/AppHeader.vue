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
          <BaseButton
            to="/dashboard"
            variant="ghost"
            size="sm"
          >
            Dashboard
          </BaseButton>
          <NuxtLink
            to="/profile"
            class="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            <BaseAvatar
              :user="user"
              size="sm"
            />
            <span class="hidden sm:inline">{{ displayNameOf(user) }}</span>
          </NuxtLink>
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
