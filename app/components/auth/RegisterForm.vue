<script setup lang="ts">
const { register } = useAuth()
const errors = useFormErrors()

const form = reactive({
  username: '',
  password: '',
  passwordConfirmation: '',
})
const loading = ref(false)

// Mirrors the API rules: username 3–30 chars (trimmed), password ≥ 6 chars.
function validate() {
  const fields: Record<string, string> = {
    username: lengthBetween(3, 30)(form.username),
    password: minLength(6)(form.password),
    passwordConfirmation: form.password === form.passwordConfirmation ? '' : 'Passwords do not match.',
  }
  errors.fields.value = fields
  return Object.values(fields).every(msg => !msg)
}

async function onSubmit() {
  errors.reset()
  if (!validate()) return

  loading.value = true
  try {
    await register({ username: form.username.trim(), password: form.password })
  }
  catch (error) {
    errors.handle(error)
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
      autocomplete="new-password"
      :error="errors.fields.value.password"
      required
    />
    <BaseInput
      v-model="form.passwordConfirmation"
      label="Confirm password"
      type="password"
      autocomplete="new-password"
      :error="errors.fields.value.passwordConfirmation"
      required
    />

    <BaseButton
      type="submit"
      :loading="loading"
      block
    >
      Create account
    </BaseButton>
  </form>
</template>
