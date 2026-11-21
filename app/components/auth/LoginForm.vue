<script setup lang="ts">
const LOCK_MS = 30 * 60 * 1000

const { login } = useAuth()
const errors = useFormErrors()

const form = reactive<LoginPayload>({ username: '', password: '' })
const loading = ref(false)

// After a 403 LOCKED, block further attempts for that username for 30 minutes.
const locked = ref<{ username: string, until: number } | null>(null)
const isLocked = computed(() =>
  !!locked.value
  && locked.value.username === form.username.trim()
  && Date.now() < locked.value.until,
)

async function onSubmit() {
  errors.reset()
  const usernameError = required(form.username)
  const passwordError = required(form.password)
  if (usernameError || passwordError) {
    errors.fields.value = { username: usernameError, password: passwordError }
    return
  }

  loading.value = true
  try {
    await login({ username: form.username.trim(), password: form.password })
  }
  catch (error) {
    errors.handle(error)
    if (errors.status.value === 'LOCKED') {
      locked.value = { username: form.username.trim(), until: Date.now() + LOCK_MS }
    }
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

    <BaseInput
      v-model="form.username"
      label="Username"
      autocomplete="username"
      :error="errors.fields.value.username"
      required
    />
    <BaseInput
      v-model="form.password"
      label="Password"
      type="password"
      autocomplete="current-password"
      :error="errors.fields.value.password"
      required
    />

    <BaseButton
      type="submit"
      :loading="loading"
      :disabled="isLocked"
      block
    >
      Log in
    </BaseButton>
  </form>
</template>
