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
  'rr-badge-transform': props.mode === 'transform',
  'rr-badge-autojump': props.mode === 'autojump',
  'rr-badge-rewrite-open': props.mode === 'rewrite-open',
}))
</script>

<template>
  <span class="rr-badge" :class="badgeClass">
    <span class="overflow-hidden text-ellipsis">{{ text }}</span>
  </span>
</template>
