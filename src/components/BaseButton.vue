<script setup lang="ts">
export type BaseButtonVariant = 'default' | 'primary' | 'danger' | 'ghost' | 'danger-ghost'

withDefaults(defineProps<{
  variant?: BaseButtonVariant
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
    class="inline-flex items-center justify-center min-h-38px gap-2 px-14px border rounded-8px cursor-pointer text-13px font-650 leading-none tracking-0 transition-[background-color,border-color,box-shadow,transform] duration-140 ease-out disabled:cursor-default disabled:opacity-48 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]"
    :class="[
      variant === 'default'
        ? 'border-[var(--rr-line-strong)] bg-[var(--rr-control)] color-[var(--rr-ink)] hover:bg-[var(--rr-control-hover)] hover:border-[var(--rr-line-strong)] hover:shadow-[0_4px_16px_var(--rr-shadow)] focus-visible:outline-[var(--rr-focus)]'
        : variant === 'primary'
          ? 'border-transparent bg-[var(--rr-green)] color-#fafff8 hover:bg-[#047857] hover:shadow-[0_4px_16px_#05966940] focus-visible:outline-[var(--rr-focus)]'
          : variant === 'danger'
            ? 'border-[var(--rr-danger-line)] bg-[var(--rr-danger-soft)] color-[var(--rr-danger-text)] hover:bg-[#fecaca] focus-visible:outline-[var(--rr-focus)]'
            : variant === 'ghost'
              ? 'border-transparent bg-transparent color-[var(--rr-muted)] hover:bg-[var(--rr-panel-muted)] hover:color-[var(--rr-ink)] focus-visible:outline-[var(--rr-focus)]'
              : 'border-transparent bg-transparent color-[var(--rr-danger-text)] hover:bg-[var(--rr-danger-soft)] focus-visible:outline-[var(--rr-focus)]',
    ]"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
