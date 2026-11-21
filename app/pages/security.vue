<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Login activity', robots: 'noindex, nofollow' })

const { myLoginEvents } = useLoginActivity()
const errors = useFormErrors()

const filters = reactive({
  days: 30,
  outcome: 'all' as 'all' | 'success' | 'failed',
})

const events = ref<LoginEvent[]>([])
const loading = ref(false)
const loaded = ref(false)
const map = ref<{ focus: (event: LoginEvent) => void }>()

async function load() {
  errors.reset()
  loading.value = true
  try {
    const res = await myLoginEvents({
      days: filters.days,
      limit: 100,
      success: filters.outcome === 'all' ? undefined : filters.outcome === 'success',
    })
    events.value = res.events
  }
  catch (error) {
    errors.handle(error)
  }
  finally {
    loading.value = false
    loaded.value = true
  }
}

watch(() => [filters.days, filters.outcome], load)
onMounted(load)

const failedCount = computed(() => events.value.filter(e => !e.success).length)
const hasLocated = computed(() => events.value.some(e => e.lat != null))

function locationDetail(event: LoginEvent) {
  if (event.lat == null) return null
  const accuracy = event.accuracyM != null
    ? ` ± ${event.accuracyM >= 1000 ? `${Math.round(event.accuracyM / 1000)} km` : `${event.accuracyM} m`}`
    : ''
  return event.source === 'gps' ? `GPS${accuracy}` : `Approximate (IP)${accuracy}`
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Login activity
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Every sign-in and failed attempt on your account, newest first.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-sm">
        <select
          v-model.number="filters.days"
          class="rounded-lg border-0 py-1.5 pr-8 pl-3 ring-1 ring-gray-300 ring-inset"
          aria-label="Time range"
        >
          <option :value="7">
            Last 7 days
          </option>
          <option :value="30">
            Last 30 days
          </option>
          <option :value="90">
            Last 90 days
          </option>
          <option :value="365">
            Last year
          </option>
        </select>
        <select
          v-model="filters.outcome"
          class="rounded-lg border-0 py-1.5 pr-8 pl-3 ring-1 ring-gray-300 ring-inset"
          aria-label="Result"
        >
          <option value="all">
            All attempts
          </option>
          <option value="success">
            Sign-ins only
          </option>
          <option value="failed">
            Failed attempts only
          </option>
        </select>
        <BaseButton
          variant="secondary"
          size="sm"
          :loading="loading"
          @click="load"
        >
          Refresh
        </BaseButton>
      </div>
    </div>

    <BaseAlert v-if="errors.message.value">
      {{ errors.message.value }}
    </BaseAlert>

    <BaseAlert
      v-else-if="failedCount && filters.outcome !== 'success'"
      variant="error"
    >
      {{ failedCount }} failed {{ failedCount === 1 ? 'attempt' : 'attempts' }} to sign in to your account.
      If that wasn't you, someone may know your username — use a strong password you don't use anywhere else.
    </BaseAlert>

    <AdminLoginMap
      v-if="hasLocated"
      ref="map"
      :events="events"
      :show-username="false"
      height="380px"
    />

    <section class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
      <div
        v-if="loaded && !events.length"
        class="p-6 text-center text-sm text-gray-500"
      >
        No login attempts in this period.
      </div>
      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-2">
                Date
              </th>
              <th class="px-4 py-2">
                Result
              </th>
              <th class="px-4 py-2">
                Location
              </th>
              <th class="px-4 py-2">
                IP address
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="event in events"
              :key="event.id"
              :class="[
                event.success ? '' : 'bg-red-50/60',
                event.lat != null ? 'cursor-pointer hover:bg-gray-50' : '',
              ]"
              @click="map?.focus(event)"
            >
              <td class="px-4 py-3 align-top whitespace-nowrap">
                {{ new Date(event.createdAt).toLocaleString() }}
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
                  :class="event.success ? 'bg-green-50 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ event.success ? 'Signed in' : 'Failed attempt' }}
                </span>
                <p
                  v-if="!event.success"
                  class="mt-1 text-xs text-red-700"
                >
                  Not you? Someone may be trying your password.
                </p>
              </td>
              <td class="px-4 py-3 align-top">
                <span :class="event.lat == null ? 'text-gray-400' : ''">
                  {{ loginEventPlace(event) }}
                </span>
                <p
                  v-if="locationDetail(event)"
                  class="text-xs text-gray-500"
                >
                  {{ locationDetail(event) }}
                </p>
              </td>
              <td class="px-4 py-3 align-top font-mono text-xs">
                {{ event.ip ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
