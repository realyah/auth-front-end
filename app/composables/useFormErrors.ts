import { FetchError } from 'ofetch'

/**
 * Turns API errors into a form message + per-field messages.
 * The API always sends `{ error }`; 400 validation errors add
 * `details: [{ field, message }]`, shown next to matching form fields.
 */
export function useFormErrors() {
  const message = ref('')
  const fields = ref<Record<string, string>>({})

  function reset() {
    message.value = ''
    fields.value = {}
  }

  /** `formFields`: the fields this form shows, so their errors go next to the input. */
  function handle(error: unknown, formFields: string[] = []) {
    reset()
    if (!(error instanceof FetchError) || !error.response) {
      message.value = 'Unable to reach the server.'
      return
    }

    const status = error.response.status
    const data = error.data as ApiError | undefined

    if (status >= 500) {
      message.value = 'Something went wrong. Please try again.'
      return
    }
    if (status === 413) {
      message.value = 'That request is too large.'
      return
    }

    const details = data?.details ?? []
    const shown: Record<string, string> = {}
    const other: string[] = []
    for (const { field, message: msg } of details) {
      if (formFields.includes(field)) shown[field] ??= msg
      else other.push(msg)
    }
    fields.value = shown

    if (details.length) message.value = other[0] ?? ''
    else message.value = data?.error ?? 'Request failed.'
  }

  return { message, fields, reset, handle }
}
