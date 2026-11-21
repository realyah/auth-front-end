<script setup lang="ts">
type Field = keyof PlayerProfile

const FIELDS: { key: Field, label: string, type?: string }[] = [
  { key: 'displayName', label: 'Display name' },
  { key: 'country', label: 'Country' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { key: 'gender', label: 'Gender' },
  { key: 'position', label: 'Position' },
  { key: 'team', label: 'Team' },
]

const { user } = useAuth()
const { updateProfile } = useProfile()
const errors = useFormErrors()

const loading = ref(false)
const saved = ref(false)

const emptyForm = (): Record<Field, string> => ({
  displayName: '', bio: '', country: '', dateOfBirth: '', gender: '', position: '', team: '',
})
const form = reactive(emptyForm())

function loadFromUser() {
  const profile = user.value?.profile
  for (const key of Object.keys(form) as Field[]) {
    form[key] = profile?.[key] ?? ''
  }
}
watch(() => user.value?.profile, loadFromUser, { immediate: true })

// Send only fields that changed; an emptied field is sent as null to clear it.
const changes = computed(() => {
  const current = user.value?.profile
  const diff: PlayerProfileUpdate = {}
  for (const key of Object.keys(form) as Field[]) {
    const value = form[key].trim()
    if (value !== (current?.[key] ?? '')) diff[key] = value || null
  }
  return diff
})
const hasChanges = computed(() => Object.keys(changes.value).length > 0)

async function onSubmit() {
  errors.reset()
  saved.value = false
  if (!hasChanges.value) return

  loading.value = true
  try {
    await updateProfile(changes.value)
    saved.value = true
  }
  catch (error) {
    errors.handle(error, Object.keys(form))
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="space-y-5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <BaseAlert v-if="errors.message.value">
      {{ errors.message.value }}
    </BaseAlert>
    <BaseAlert
      v-else-if="saved && !hasChanges"
      variant="success"
    >
      Profile saved.
    </BaseAlert>

    <div class="grid gap-5 sm:grid-cols-2">
      <BaseInput
        v-for="field in FIELDS"
        :key="field.key"
        v-model="form[field.key]"
        :label="field.label"
        :type="field.type"
        :error="errors.fields.value[field.key]"
      />
    </div>

    <div class="space-y-1.5">
      <label
        for="profile-bio"
        class="block text-sm font-medium text-gray-700"
      >
        Bio
      </label>
      <textarea
        id="profile-bio"
        v-model="form.bio"
        rows="4"
        maxlength="500"
        class="block w-full rounded-lg border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm"
      />
      <p
        v-if="errors.fields.value.bio"
        class="text-sm text-red-600"
      >
        {{ errors.fields.value.bio }}
      </p>
    </div>

    <div class="flex justify-end gap-2">
      <BaseButton
        variant="ghost"
        :disabled="!hasChanges || loading"
        @click="loadFromUser"
      >
        Reset
      </BaseButton>
      <BaseButton
        type="submit"
        :loading="loading"
        :disabled="!hasChanges"
      >
        Save changes
      </BaseButton>
    </div>
  </form>
</template>
