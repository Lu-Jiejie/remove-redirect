<script setup lang="ts">
import type { RuleMode } from '~/types/rules'
import { computed } from 'vue'
import { ruleModeMeta } from './ruleUi'

const props = withDefaults(defineProps<{
  mode: RuleMode
  short?: boolean
}>(), {
  short: false,
})

const meta = computed(() => ruleModeMeta[props.mode])
const text = computed(() => props.short ? meta.value.shortLabel : meta.value.label)
const badgeClass = computed(() => ({
  'border-[var(--rr-blue-line)] bg-[var(--rr-blue-soft)] color-[var(--rr-blue-text)]': props.mode === 'transform',
  'border-[var(--rr-green-line)] bg-[var(--rr-green-soft)] color-[var(--rr-green-text)]': props.mode === 'autojump',
  'border-[var(--rr-orange-line)] bg-[var(--rr-orange-soft)] color-[var(--rr-orange-text)]': props.mode === 'rewrite-open',
}))
</script>

<template>
  <span class="inline-flex max-w-full items-center min-h-22px rounded-6px border px-7px text-11px font-650 leading-none tracking-0 whitespace-nowrap" :class="badgeClass">
    <span class="overflow-hidden text-ellipsis">{{ text }}</span>
  </span>
</template>
