<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  mono?: boolean
  placeholder?: string
}>(), {
  modelValue: '',
  mono: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})
</script>

<template>
  <input
    v-model="value"
    class="h-40px w-full min-w-0 border border-[var(--rr-ink)]/10 rounded-8px bg-[var(--rr-control)] px-12px color-[var(--rr-ink)] text-14px tracking-0 outline-none transition-[background-color,border-color,box-shadow] duration-140 ease-out placeholder:color-[var(--rr-subtle)] focus:border-[var(--rr-green)]/34 focus:bg-[var(--rr-control-hover)] focus:shadow-[0_0_0_3px_var(--rr-green)]/34"
    :class="mono ? 'font-mono text-13px' : ''"
    :placeholder="placeholder"
  >
</template>
