<script setup lang="ts">
const { login } = useAuth()
const store = useAuthStore()
const errors = useFormErrors()

const loading = ref(false)
const form = reactive({ username: '', password: '' })
const captcha = ref<{ reset: () => void, enabled: boolean }>()
const captchaToken = ref('')

// Location is requested automatically when the page opens, so it's usually
// ready by the time the user submits. The browser still shows its own
// permission prompt the first time (that can't be skipped). If the user
// declines or it fails, login goes ahead and the server uses the IP instead.
const GEO_MAX_WAIT_MS = 3000
let pendingGeo: Promise<LoginGeo | undefined> | null = null

onMounted(() => {
  pendingGeo = getGeo()
})

/** The location if it's ready within a short wait — never holds up login for long. */
function geoForLogin() {
  if (!pendingGeo) return Promise.resolve(undefined)
  const giveUp = new Promise<undefined>(resolve => setTimeout(resolve, GEO_MAX_WAIT_MS))
  return Promise.race([pendingGeo, giveUp])
}

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
    // Never blocks login: undefined on denial, failure or a slow answer.
    const geo = await geoForLogin()
    await login({
      username: form.username.trim(),
      password: form.password,
      ...(geo && { geo }),
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

    <p class="text-center text-xs text-gray-500">
      We record where you sign in from to protect your account.
    </p>
  </form>
</template>
