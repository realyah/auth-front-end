<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Dashboard', robots: 'noindex, nofollow' })

const { user } = useAuth()

const profile = computed(() => user.value?.profile)
const lastLogin = computed(() => user.value?.userAgentString)

function formatDate(value?: string | null, withTime = true) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return withTime ? date.toLocaleString() : date.toLocaleDateString()
}

function ageFrom(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  if (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())) age--
  return age
}

const playerDetails = computed(() => {
  const age = ageFrom(profile.value?.dateOfBirth)
  const dob = formatDate(profile.value?.dateOfBirth, false)
  return [
    { label: 'Display name', value: profile.value?.displayName },
    { label: 'Username', value: user.value ? `@${user.value.username}` : null },
    { label: 'Position', value: profile.value?.position },
    { label: 'Team', value: profile.value?.team },
    { label: 'Country', value: profile.value?.country },
    { label: 'Date of birth', value: dob ? (age !== null ? `${dob} (${age})` : dob) : null },
    { label: 'Gender', value: profile.value?.gender },
    { label: 'Member since', value: formatDate(user.value?.createdAt, false) },
  ]
})

const loginDetails = computed(() => [
  { label: 'Last login', value: formatDate(lastLogin.value?.loggedInAt) },
  { label: 'Status', value: lastLogin.value?.loginStatus ?? user.value?.login_status },
  { label: 'Browser', value: lastLogin.value?.browser },
  { label: 'Operating system', value: lastLogin.value?.os },
  { label: 'Device', value: lastLogin.value?.deviceType },
  { label: 'IP address', value: lastLogin.value?.ipAddress },
])

// Share of the 7 player fields + picture that are filled in.
const completion = computed(() => {
  const values = Object.values(profile.value ?? {})
  const total = values.length + 1
  const done = values.filter(Boolean).length + (user.value?.avatarUrl ? 1 : 0)
  return Math.round((done / total) * 100)
})
</script>

<template>
  <div
    v-if="user"
    class="space-y-6"
  >
    <!-- Player card -->
    <section class="flex flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-gray-200 sm:flex-row sm:items-center">
      <BaseAvatar
        :user="user"
        size="lg"
      />
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-2xl font-bold">
          {{ displayNameOf(user) }}
        </h1>
        <p class="mt-1 text-gray-600">
          @{{ user.username }}
          <template v-if="profile?.position || profile?.team">
            · {{ [profile?.position, profile?.team].filter(Boolean).join(' · ') }}
          </template>
        </p>
        <div class="mt-3 max-w-xs">
          <div class="flex justify-between text-xs text-gray-500">
            <span>Profile complete</span>
            <span>{{ completion }}%</span>
          </div>
          <div class="mt-1 h-1.5 rounded-full bg-gray-100">
            <div
              class="h-1.5 rounded-full bg-brand-600"
              :style="{ width: `${completion}%` }"
            />
          </div>
        </div>
      </div>
      <BaseButton
        to="/profile"
        variant="secondary"
      >
        Edit profile
      </BaseButton>
    </section>

    <!-- Bio -->
    <section class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
      <h2 class="font-semibold">
        Bio
      </h2>
      <p
        v-if="profile?.bio"
        class="mt-2 whitespace-pre-line text-gray-700"
      >
        {{ profile.bio }}
      </p>
      <p
        v-else
        class="mt-2 text-sm text-gray-400"
      >
        No bio yet.
      </p>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Player details -->
      <section class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
        <h2 class="mb-4 font-semibold">
          Player details
        </h2>
        <dl class="divide-y divide-gray-100">
          <div
            v-for="item in playerDetails"
            :key="item.label"
            class="flex justify-between gap-4 py-2.5 text-sm"
          >
            <dt class="text-gray-500">
              {{ item.label }}
            </dt>
            <dd
              class="text-right font-medium"
              :class="item.value ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ item.value || 'Not set' }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Login activity -->
      <section class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
        <h2 class="mb-4 font-semibold">
          Login activity
        </h2>
        <dl class="divide-y divide-gray-100">
          <div
            v-for="item in loginDetails"
            :key="item.label"
            class="flex justify-between gap-4 py-2.5 text-sm"
          >
            <dt class="text-gray-500">
              {{ item.label }}
            </dt>
            <dd
              class="text-right font-medium"
              :class="item.value ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ item.value || '—' }}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>
