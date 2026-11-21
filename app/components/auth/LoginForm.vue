<script setup lang="ts">
const { login } = useAuth()
const store = useAuthStore()
const errors = useFormErrors()

const loading = ref(false)
const form = reactive({ username: '', password: '' })
const captcha = ref<{ reset: () => void, enabled: boolean }>()
const captchaToken = ref('')

// Optional, unticked by default. Location is requested as soon as the box is
// ticked so the permission prompt doesn't delay the login itself.
const shareLocation = ref(false)
const geoState = ref<'idle' | 'locating' | 'ready' | 'unavailable'>('idle')
let pendingGeo: Promise<LoginGeo | undefined> | null = null

watch(shareLocation, (on) => {
  if (!on) {
    pendingGeo = null
    geoState.value = 'idle'
    return
  }
  geoState.value = 'locating'
  const request = getGeo()
  pendingGeo = request
  request.then((geo) => {
    if (pendingGeo === request) geoState.value = geo ? 'ready' : 'unavailable'
  })
})

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
    // Never blocks login: getGeo() resolves undefined on denial/failure/timeout.
    const geo = shareLocation.value && pendingGeo ? await pendingGeo : undefined
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

    <div class="space-y-1">
      <label class="flex items-start gap-2 text-sm text-gray-700">
        <input
          v-model="shareLocation"
          type="checkbox"
          class="mt-0.5 size-4 rounded border-gray-300 accent-brand-600"
        >
        Share my location to protect my account
      </label>
      <p
        v-if="geoState !== 'idle'"
        class="pl-6 text-xs"
        :class="geoState === 'unavailable' ? 'text-amber-600' : 'text-gray-500'"
      >
        <template v-if="geoState === 'locating'">
          Getting your location…
        </template>
        <template v-else-if="geoState === 'ready'">
          Location ready.
        </template>
        <template v-else>
          Location unavailable — you can still log in.
        </template>
      </p>
    </div>

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
