<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useSeoMeta({ title: 'Login map', robots: 'noindex, nofollow' })

const { loginEvents } = useAdmin()
const errors = useFormErrors()

const filters = reactive({
  days: 30,
  outcome: 'all' as 'all' | 'success' | 'failed',
  limit: 1000,
})
const userFilter = ref<{ id: string, username: string | null } | null>(null)

const events = ref<LoginEvent[]>([])
const loading = ref(false)
const map = ref<{ focus: (event: LoginEvent) => void }>()

async function load() {
  errors.reset()
  loading.value = true
  try {
    const res = await loginEvents({
      days: filters.days,
      limit: filters.limit,
      userId: userFilter.value?.id,
      success: filters.outcome === 'all' ? undefined : filters.outcome === 'success',
    })
    events.value = res.events
  }
  catch (error) {
    errors.handle(error)
  }
  finally {
    loading.value = false
  }
}

watch([() => filters.days, () => filters.outcome, () => filters.limit, userFilter], load)
onMounted(load)

const stats = computed(() => {
  const failed = events.value.filter(e => !e.success).length
  return {
    total: events.value.length,
    success: events.value.length - failed,
    failed,
    gps: events.value.filter(e => e.source === 'gps').length,
    users: new Set(events.value.map(e => e.userId)).size,
  }
})

const statCards = computed<{ label: string, value: number, dot?: string }[]>(() => [
  { label: 'Attempts', value: stats.value.total },
  { label: 'Successful', value: stats.value.success, dot: 'bg-green-600' },
  { label: 'Failed', value: stats.value.failed, dot: 'bg-red-600' },
  { label: 'From GPS', value: stats.value.gps },
  { label: 'Users', value: stats.value.users },
])

function filterByUser(event: LoginEvent) {
  if (event.userId) userFilter.value = { id: event.userId, username: event.username }
}

const place = loginEventPlace
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Login map
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Where login attempts came from. Only attempts with a known location are shown.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-sm">
        <select
          v-model.number="filters.days"
          class="rounded-lg border-0 py-1.5 pr-8 pl-3 ring-1 ring-gray-300 ring-inset"
          aria-label="Time range"
        >
          <option :value="1">
            Last 24 hours
          </option>
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
            All results
          </option>
          <option value="success">
            Successful only
          </option>
          <option value="failed">
            Failed only
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

    <div
      v-if="userFilter"
      class="flex items-center gap-2 text-sm"
    >
      <span class="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
        User: {{ userFilter.username ?? userFilter.id }}
      </span>
      <button
        type="button"
        class="text-gray-500 hover:text-gray-900"
        @click="userFilter = null"
      >
        Clear
      </button>
    </div>

    <BaseAlert v-if="errors.message.value">
      {{ errors.message.value }}
    </BaseAlert>

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div
        v-for="item in statCards"
        :key="item.label"
        class="rounded-xl bg-white p-3 ring-1 ring-gray-200"
      >
        <dt class="flex items-center gap-1.5 text-xs text-gray-500">
          <span
            v-if="item.dot"
            class="size-2 rounded-full"
            :class="item.dot"
          />
          {{ item.label }}
        </dt>
        <dd class="mt-1 text-xl font-semibold">
          {{ item.value }}
        </dd>
      </div>
    </dl>

    <AdminLoginMap
      ref="map"
      :events="events"
    />

    <section class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
      <div
        v-if="!events.length && !loading"
        class="p-6 text-center text-sm text-gray-500"
      >
        No located login attempts in this period.
      </div>
      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-2">
                When
              </th>
              <th class="px-4 py-2">
                User
              </th>
              <th class="px-4 py-2">
                Result
              </th>
              <th class="px-4 py-2">
                Place
              </th>
              <th class="px-4 py-2">
                IP
              </th>
              <th class="px-4 py-2">
                Source
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="event in events"
              :key="event.id"
              class="cursor-pointer hover:bg-gray-50"
              @click="map?.focus(event)"
            >
              <td class="px-4 py-2 whitespace-nowrap">
                {{ new Date(event.createdAt).toLocaleString() }}
              </td>
              <td class="px-4 py-2">
                <button
                  type="button"
                  class="font-medium text-brand-600 hover:text-brand-700"
                  @click.stop="filterByUser(event)"
                >
                  {{ event.username ?? '—' }}
                </button>
              </td>
              <td class="px-4 py-2">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="event.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                >
                  {{ event.success ? 'Success' : 'Failed' }}
                </span>
              </td>
              <td class="px-4 py-2">
                {{ place(event) }}
              </td>
              <td class="px-4 py-2 font-mono text-xs">
                {{ event.ip ?? '—' }}
              </td>
              <td class="px-4 py-2">
                {{ event.source === 'gps' ? 'GPS' : 'IP' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
