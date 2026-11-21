<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  type?: string
  placeholder?: string
  autocomplete?: string
  error?: string
  required?: boolean
}>(), {
  type: 'text',
})

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="block w-full rounded-lg border-0 px-3 py-2 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm"
      :class="error ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-300 focus:ring-brand-600'"
    >
    <p
      v-if="error"
      :id="`${id}-error`"
      class="text-sm text-red-600"
    >
      {{ error }}
    </p>
  </div>
</template>
