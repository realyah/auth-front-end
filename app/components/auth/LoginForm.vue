<script setup lang="ts">
const { login } = useAuth()
const store = useAuthStore()
const errors = useFormErrors()

const loading = ref(false)
const form = reactive({ username: '', password: '' })
const captcha = ref<{ reset: () => void, enabled: boolean }>()
const captchaToken = ref('')

// Failures all come back as "Invalid username or password" (401),
// or "Too many attempts…" (429) after 10 tries in 15 minutes.
async function onSubmit() {
  errors.reset()
  const fields = { username: required(form.username), password: required(form.password) }
  if (fields.username || fields.password) {
    errors.fields.value = fields
    return
  }
  if (captcha.value?.enabled && !captchaToken.value) {
    errors.message.value = 'Please complete the CAPTCHA.'
    return
  }

  loading.value = true
  try {
    await login({
      username: form.username.trim(),
      password: form.password,
      ...(captchaToken.value && { captchaToken: captchaToken.value }),
    })
  }
  catch (error) {
    errors.handle(error, ['username', 'password'])
  }
  finally {
    captcha.value?.reset()
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
    <BaseAlert
      v-if="store.notice && !errors.message.value"
      variant="info"
    >
      {{ store.notice }}
    </BaseAlert>
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

    <AuthCaptchaWidget
      ref="captcha"
      v-model="captchaToken"
    />

    <BaseButton
      type="submit"
      :loading="loading"
      block
    >
      Log in
    </BaseButton>
  </form>
</template>
