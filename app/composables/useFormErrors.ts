import { FetchError } from 'ofetch'

/**
 * Turns API errors into a message for the form.
 * The API always responds with `{ error }`; login failures add
 * `status` (FAILED_PASSWORD | LOCKED) and sometimes `remainingAttempts`.
 * `fields` holds client-side validation messages.
 */
export function useFormErrors() {
  const message = ref('')
  const fields = ref<Record<string, string>>({})
  const status = ref<AuthStatus | undefined>()

  function reset() {
    message.value = ''
    fields.value = {}
    status.value = undefined
  }

  function handle(error: unknown) {
    reset()
    if (!(error instanceof FetchError) || !error.response) {
      message.value = 'Unable to reach the server.'
      return
    }

    const data = error.data as ApiError | undefined
    status.value = data?.status

    if (data?.status === 'LOCKED') {
      message.value = 'Account locked, try again in 30 minutes.'
    }
    else if (data?.status === 'FAILED_PASSWORD') {
      message.value = typeof data.remainingAttempts === 'number'
        ? `Invalid credentials — ${data.remainingAttempts} ${data.remainingAttempts === 1 ? 'try' : 'tries'} left.`
        : 'Invalid credentials.'
    }
    else if (error.response.status >= 500) {
      message.value = 'Something went wrong. Please try again.'
    }
    else {
      message.value = data?.error ?? 'Request failed.'
    }
  }

  return { message, fields, status, reset, handle }
}
