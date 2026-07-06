<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}>(), {
  variant: 'default',
  disabled: false,
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center min-h-38px gap-2 px-14px border rounded-8px cursor-pointer text-13px font-650 leading-none tracking-0 transition-[background-color,border-color,box-shadow,transform] duration-140 ease-out disabled:cursor-default disabled:opacity-48 focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="[
      variant === 'default'
        ? 'border-[var(--rr-line-strong)] bg-[var(--rr-control)] color-[var(--rr-ink)] hover:bg-[var(--rr-control-hover)] hover:shadow-[0_8px_24px_var(--rr-shadow)] focus-visible:outline-[var(--rr-focus)]'
        : variant === 'primary'
          ? 'border-[var(--rr-green-line)] bg-[var(--rr-green)] color-#fafff8 hover:bg-#007a48 focus-visible:outline-[var(--rr-focus)]'
          : 'border-[var(--rr-danger-line)] bg-[var(--rr-danger-soft)] color-[var(--rr-danger-text)] focus-visible:outline-[var(--rr-focus)]',
    ]"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
