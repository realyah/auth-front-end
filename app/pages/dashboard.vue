<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Dashboard' })

const { user } = useAuth()
const lastLogin = computed(() => user.value?.userAgentString)

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : '—'
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">
      Dashboard
    </h1>
    <p class="mt-2 text-gray-600">
      Signed in as <span class="font-medium text-gray-900">{{ user?.username }}</span>
    </p>

    <dl
      v-if="user"
      class="mt-8 grid gap-4 sm:grid-cols-2"
    >
      <div class="rounded-xl bg-white p-4 ring-1 ring-gray-200">
        <dt class="text-sm text-gray-500">
          Member since
        </dt>
        <dd class="mt-1 font-medium">
          {{ formatDate(user.createdAt) }}
        </dd>
      </div>
      <div class="rounded-xl bg-white p-4 ring-1 ring-gray-200">
        <dt class="text-sm text-gray-500">
          Last login
        </dt>
        <dd class="mt-1 font-medium">
          {{ formatDate(lastLogin?.loggedInAt) }}
        </dd>
      </div>
      <div class="rounded-xl bg-white p-4 ring-1 ring-gray-200">
        <dt class="text-sm text-gray-500">
          Device
        </dt>
        <dd class="mt-1 font-medium">
          {{ [lastLogin?.browser, lastLogin?.os, lastLogin?.deviceType].filter(Boolean).join(' · ') || '—' }}
        </dd>
      </div>
      <div class="rounded-xl bg-white p-4 ring-1 ring-gray-200">
        <dt class="text-sm text-gray-500">
          IP address
        </dt>
        <dd class="mt-1 font-medium">
          {{ lastLogin?.ipAddress ?? '—' }}
        </dd>
      </div>
    </dl>
  </div>
</template>
