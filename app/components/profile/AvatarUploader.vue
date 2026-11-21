<script setup lang="ts">
const { user } = useAuth()
const { validateAvatar, uploadAvatar, deleteAvatar } = useProfile()
const errors = useFormErrors()

const input = ref<HTMLInputElement>()
const busy = ref<'upload' | 'delete' | null>(null)
const accept = AVATAR_TYPES.join(',')

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (input.value) input.value.value = '' // allow re-selecting the same file
  if (!file) return

  errors.reset()
  const invalid = validateAvatar(file)
  if (invalid) {
    errors.message.value = invalid
    return
  }

  busy.value = 'upload'
  try {
    await uploadAvatar(file)
  }
  catch (error) {
    errors.handle(error)
  }
  finally {
    busy.value = null
  }
}

async function onDelete() {
  errors.reset()
  busy.value = 'delete'
  try {
    await deleteAvatar()
  }
  catch (error) {
    errors.handle(error)
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-5">
      <BaseAvatar
        :user="user"
        size="lg"
      />
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <BaseButton
            variant="secondary"
            size="sm"
            :loading="busy === 'upload'"
            :disabled="!!busy"
            @click="input?.click()"
          >
            {{ user?.avatarUrl ? 'Change picture' : 'Upload picture' }}
          </BaseButton>
          <BaseButton
            v-if="user?.avatarUrl"
            variant="ghost"
            size="sm"
            :loading="busy === 'delete'"
            :disabled="!!busy"
            @click="onDelete"
          >
            Remove
          </BaseButton>
        </div>
        <p class="text-xs text-gray-500">
          JPEG, PNG or WebP, up to 2 MB.
        </p>
      </div>
      <input
        ref="input"
        type="file"
        :accept="accept"
        class="hidden"
        @change="onFileChange"
      >
    </div>
    <BaseAlert v-if="errors.message.value">
      {{ errors.message.value }}
    </BaseAlert>
  </div>
</template>
