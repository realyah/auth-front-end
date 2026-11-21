// Auto-imported helpers. Each returns an error message or '' when valid.
// Rules mirror the API's validation schemas.

export const minLength = (min: number) => (value: string) =>
  value.length >= min ? '' : `Must be at least ${min} characters.`

export const lengthBetween = (min: number, max: number) => (value: string) => {
  const length = value.trim().length
  return length >= min && length <= max ? '' : `Must be ${min}–${max} characters.`
}

export const required = (value: string) =>
  value.trim() ? '' : 'This field is required.'

/** 3–30 characters: letters, numbers, ".", "_" and "-". */
export const usernameRule = (value: string) =>
  lengthBetween(3, 30)(value)
  || (/^[\w.-]+$/.test(value.trim()) ? '' : 'Only letters, numbers, ".", "_" and "-".')

/** 12–128 characters. */
export const newPasswordRule = (value: string) =>
  value.length >= 12 && value.length <= 128 ? '' : 'Must be 12–128 characters.'
