<script setup lang="ts">
const { register } = useAuth()
const errors = useFormErrors()

const form = reactive({
  username: '',
  password: '',
  passwordConfirmation: '',
})
const loading = ref(false)
const captcha = ref<{ reset: () => void, enabled: boolean }>()
const captchaToken = ref('')

// Mirrors the API rules: username 3–30 of letters, numbers, . _ -; password 12–128.
function validate() {
  const fields: Record<string, string> = {
    username: usernameRule(form.username),
    password: newPasswordRule(form.password),
    passwordConfirmation: form.password === form.passwordConfirmation ? '' : 'Passwords do not match.',
  }
  errors.fields.value = fields
  return Object.values(fields).every(msg => !msg)
}

async function onSubmit() {
  errors.reset()
  if (!validate()) return
  if (captcha.value?.enabled && !captchaToken.value) {
    errors.message.value = 'Please complete the CAPTCHA.'
    return
  }

  loading.value = true
  try {
    await register({
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
    <p
      v-if="!errors.fields.value.username"
      class="-mt-3 text-xs text-gray-500"
    >
      3–30 characters: letters, numbers, ".", "_" and "-".
    </p>
    <BaseInput
      v-model="form.password"
      label="Password"
      type="password"
      autocomplete="new-password"
      :error="errors.fields.value.password"
      required
    />
    <p
      v-if="!errors.fields.value.password"
      class="-mt-3 text-xs text-gray-500"
    >
      At least 12 characters. A short phrase is easy to remember.
    </p>
    <BaseInput
      v-model="form.passwordConfirmation"
      label="Confirm password"
      type="password"
      autocomplete="new-password"
      :error="errors.fields.value.passwordConfirmation"
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
      Create account
    </BaseButton>
  </form>
</template>
