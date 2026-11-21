// Auto-imported helpers. Each returns an error message or '' when valid.

export const minLength = (min: number) => (value: string) =>
  value.length >= min ? '' : `Must be at least ${min} characters.`

export const lengthBetween = (min: number, max: number) => (value: string) => {
  const length = value.trim().length
  return length >= min && length <= max ? '' : `Must be ${min}–${max} characters.`
}

export const required = (value: string) =>
  value.trim() ? '' : 'This field is required.'
