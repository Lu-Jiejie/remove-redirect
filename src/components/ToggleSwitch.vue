<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  size?: 'sm' | 'md'
}>(), {
  label: '切换状态',
  size: 'md',
})

const checked = defineModel<boolean>({ required: true })

const switchClasses = computed(() => ({
  'h-24px w-38px': props.size === 'sm',
  'h-28px w-46px': props.size !== 'sm',
}))

const trackClasses = computed(() => ({
  'h-20px w-34px': props.size === 'sm',
  'h-24px w-42px': props.size !== 'sm',
  'border-[var(--rr-green-line)] bg-[var(--rr-green)]': checked.value,
  'border-[var(--rr-line-strong)] bg-[var(--rr-switch-off)]': !checked.value,
}))

const thumbClasses = computed(() => ({
  'h-12px w-12px': props.size === 'sm',
  'h-16px w-16px': props.size !== 'sm',
  'translate-x-14px': props.size === 'sm' && checked.value,
  'translate-x-18px': props.size !== 'sm' && checked.value,
}))

function toggle() {
  checked.value = !checked.value
}
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :aria-pressed="checked"
    class="inline-flex items-center justify-center border-0 bg-transparent p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-3"
    :class="switchClasses"
    @click="toggle"
  >
    <span
      class="relative rounded-full border shadow-[inset_0_1px_2px_var(--rr-inset)] transition-[background-color,border-color] duration-160 ease-out"
      :class="trackClasses"
    >
      <span
        class="absolute left-3px top-3px rounded-full bg-[var(--rr-switch-thumb)] shadow-[0_2px_8px_var(--rr-shadow)] transition-transform duration-180 ease-out"
        :class="thumbClasses"
      />
    </span>
  </button>
</template>
