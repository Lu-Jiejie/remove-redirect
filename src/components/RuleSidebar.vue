<script setup lang="ts">
import type { RuleListEntry, RuleStats } from './types'
import AppBrand from './AppBrand.vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import ModeBadge from './ModeBadge.vue'
import ThemeToggle from './ThemeToggle.vue'
import ToggleSwitch from './ToggleSwitch.vue'

defineProps<{
  entries: RuleListEntry[]
  activeId: string | null
  stats: RuleStats
}>()

const emit = defineEmits<{
  add: []
  select: [id: string]
}>()

const search = defineModel<string>('search', { required: true })
const enabled = defineModel<boolean>('enabled', { required: true })
</script>

<template>
  <aside class="flex h-100vh w-356px min-w-300px flex-col border-r border-[var(--rr-ink)]/10 bg-[var(--rr-sidebar)] max-md:h-auto max-md:max-h-70vh max-md:w-full max-md:min-w-0 max-md:border-b max-md:border-r-0">
    <header class="flex items-center justify-between gap-14px px-22px pb-16px pt-24px">
      <AppBrand />
      <ThemeToggle />
    </header>

    <section class="mx-16px mb-14px flex items-center justify-between rounded-10px bg-[var(--rr-panel)] border border-[var(--rr-ink)]/10 px-16px py-13px">
      <span class="text-17px font-700 leading-none tracking-0" :class="enabled ? 'color-[var(--rr-green-text)]' : 'color-[var(--rr-orange-text)]'">
        {{ enabled ? '已启用' : '已暂停' }}
      </span>
      <ToggleSwitch v-model="enabled" label="切换全局引擎" />
    </section>

    <section class="mx-16px mb-14px grid grid-cols-3 gap-8px" aria-label="规则统计">
      <div class="border border-[var(--rr-ink)]/10 rounded-10px bg-[var(--rr-panel)] min-w-0 px-10px py-11px">
        <span class="block color-[var(--rr-ink)] font-mono text-20px font-650 leading-none tracking-tight">{{ stats.total }}</span>
        <span class="mt-6px block color-[var(--rr-muted)] text-11px font-500 leading-none">总数</span>
      </div>
      <div class="border border-[var(--rr-ink)]/10 rounded-10px bg-[var(--rr-panel)] min-w-0 px-10px py-11px">
        <span class="block color-[var(--rr-ink)] font-mono text-20px font-650 leading-none tracking-tight">{{ stats.enabled }}</span>
        <span class="mt-6px block color-[var(--rr-muted)] text-11px font-500 leading-none">启用</span>
      </div>
      <div class="border border-[var(--rr-ink)]/10 rounded-10px bg-[var(--rr-panel)] min-w-0 px-10px py-11px">
        <span class="block color-[var(--rr-ink)] font-mono text-20px font-650 leading-none tracking-tight">{{ stats.user }}</span>
        <span class="mt-6px block color-[var(--rr-muted)] text-11px font-500 leading-none">自定义</span>
      </div>
    </section>

    <label class="relative mx-16px mb-14px block">
      <span class="i-carbon:search absolute left-12px top-1/2 h-15px w-15px color-[var(--rr-muted)] -translate-y-1/2" />
      <BaseInput
        v-model="search"
        class="pl-36px leading-[1.4]"
        placeholder="搜索名称或域名"
      />
    </label>

    <div class="flex items-center justify-between px-22px pb-8px color-[var(--rr-muted)] text-11px font-600 leading-[1.35]">
      <span>规则库</span>
      <span>{{ entries.length }} / {{ stats.total }}</span>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-6px overflow-y-auto px-10px pb-12px" style="scrollbar-gutter: stable">
      <div v-if="entries.length === 0" class="m-18px mx-8px border border-dashed border-[var(--rr-ink)]/19 rounded-10px px-12px py-22px color-[var(--rr-muted)] text-center text-13px">
        无匹配规则
      </div>

      <button
        v-for="{ rule, isBuiltin } in entries"
        :key="rule.id"
        type="button"
        class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-12px border rounded-10px bg-transparent px-11px py-11px pl-12px color-inherit text-left cursor-pointer transition-[background-color,border-color,transform] duration-140 ease-out hover:border-[var(--rr-ink)]/10 hover:bg-[var(--rr-panel)] hover:shadow-[0_2px_8px_var(--rr-shadow)] active:scale-[0.98]"
        :class="{
          'border-[var(--rr-green)]/34 bg-[var(--rr-green-soft)] shadow-[0_2px_8px_var(--rr-shadow)]': activeId === rule.id,
          'border-transparent': activeId !== rule.id,
          'opacity-52': !rule.enabled,
        }"
        @click="emit('select', rule.id)"
      >
        <span class="min-w-0">
          <span class="block overflow-hidden color-[var(--rr-ink)] text-14px font-620 leading-[1.45] tracking-0 text-ellipsis whitespace-nowrap">{{ rule.name }}</span>
          <span class="font-mono mt-3px block overflow-hidden color-[var(--rr-muted)] text-11px leading-[1.45] text-ellipsis whitespace-nowrap">{{ rule.domain }}</span>
        </span>
        <span class="flex flex-col items-end gap-6px">
          <ModeBadge :mode="rule.mode" short />
          <span v-if="isBuiltin" class="color-[var(--rr-muted)] text-11px leading-none">内置</span>
        </span>
      </button>
    </div>

    <footer class="border-t border-[var(--rr-ink)]/10 px-16px pb-16px pt-12px">
      <BaseButton variant="primary" class="w-full gap-8px" @click="emit('add')">
        <span class="i-carbon:add" />
        <span>新建规则</span>
      </BaseButton>
    </footer>
  </aside>
</template>
