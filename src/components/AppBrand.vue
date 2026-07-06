<script setup lang="ts">
import { computed } from 'vue'
import logoUrl from '~/assets/icon.svg'

const props = withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})

const brandSize = computed(() => props.compact ? 'text-14px' : 'text-16px')
const logoSize = computed(() => props.compact ? 'h-19px w-19px' : 'h-22px w-22px')
const boxSize = computed(() => props.compact ? 'h-34px w-34px' : 'h-40px w-40px')
</script>

<template>
  <div class="flex min-w-0 items-center" :class="compact ? 'gap-10px' : 'gap-12px'">
    <span class="grid flex-none place-items-center border border-[var(--rr-ink)]/10 rounded-10px bg-[var(--rr-mark)] shadow-[inset_0_-1px_0_var(--rr-inset),0_2px_8px_var(--rr-shadow)]" :class="boxSize">
      <img :src="logoUrl" alt="" class="block" :class="logoSize">
    </span>
    <div class="min-w-0">
      <div
        class="overflow-hidden color-[var(--rr-ink)] font-700 leading-[1.25] tracking-0 text-ellipsis whitespace-nowrap"
        :class="brandSize"
      >
        Remove Redirect
      </div>
    </div>
  </div>
</template>
