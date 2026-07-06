<script setup lang="ts">
import { computed } from 'vue'
import logoUrl from '~/assets/logo.svg'

const props = withDefaults(defineProps<{
  compact?: boolean
  status?: 'active' | 'paused'
}>(), {
  compact: false,
  status: 'active',
})

const statusText = computed(() => props.status === 'active' ? '已启用' : '已暂停')
const dotClass = computed(() => props.status === 'active' ? 'bg-[var(--rr-green)] shadow-[0_0_0_3px_var(--rr-green-soft)]' : 'bg-[var(--rr-orange)] shadow-[0_0_0_3px_var(--rr-orange-soft)]')
</script>

<template>
  <div class="flex min-w-0 items-center" :class="compact ? 'gap-10px' : 'gap-12px'">
    <span class="rr-brand-mark" :class="compact ? 'h-34px w-34px' : ''">
      <img :src="logoUrl" alt="" class="block h-22px w-22px" :class="compact ? 'h-19px w-19px' : ''">
    </span>
    <div class="min-w-0">
      <div
        class="overflow-hidden color-[var(--rr-ink)] font-700 leading-[1.25] tracking-0 text-ellipsis whitespace-nowrap"
        :class="compact ? 'text-14px' : 'text-16px'"
      >
        Remove Redirect
      </div>
      <div v-if="!compact" class="mt-5px flex items-center gap-6px color-[var(--rr-muted)] text-12px leading-none">
        <span class="h-6px w-6px rounded-full" :class="dotClass" />
        <span>{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>
