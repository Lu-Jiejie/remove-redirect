<script setup lang="ts">
import type { RuleListEntry, RuleStats } from './types'
import AppBrand from './AppBrand.vue'
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
  <aside class="flex h-100vh w-340px min-w-300px flex-col border-r border-[var(--rr-line)] bg-[var(--rr-sidebar)] max-md:h-auto max-md:max-h-70vh max-md:w-full max-md:min-w-0 max-md:border-b max-md:border-r-0">
    <header class="flex items-center justify-between gap-14px px-22px pb-18px pt-24px">
      <AppBrand :status="enabled ? 'active' : 'paused'" />
      <ThemeToggle />
    </header>

    <section class="rr-panel mx-16px mb-14px flex items-center justify-between p-14px">
      <div>
        <div class="rr-label">
          全局引擎
        </div>
        <div class="mt-6px text-15px font-650 leading-none" :class="enabled ? 'color-[var(--rr-green-text)]' : 'color-[var(--rr-orange-text)]'">
          {{ enabled ? '已启用' : '已暂停' }}
        </div>
      </div>
      <ToggleSwitch v-model="enabled" label="切换全局引擎" />
    </section>

    <section class="mx-16px mb-14px grid grid-cols-3 gap-8px" aria-label="规则统计">
      <div class="rr-panel-muted min-w-0 px-8px py-10px">
        <span class="block color-[var(--rr-ink)] rr-mono text-18px font-650 leading-none">{{ stats.total }}</span>
        <span class="mt-6px block color-[var(--rr-muted)] text-11px leading-none">总数</span>
      </div>
      <div class="rr-panel-muted min-w-0 px-8px py-10px">
        <span class="block color-[var(--rr-ink)] rr-mono text-18px font-650 leading-none">{{ stats.enabled }}</span>
        <span class="mt-6px block color-[var(--rr-muted)] text-11px leading-none">启用</span>
      </div>
      <div class="rr-panel-muted min-w-0 px-8px py-10px">
        <span class="block color-[var(--rr-ink)] rr-mono text-18px font-650 leading-none">{{ stats.user }}</span>
        <span class="mt-6px block color-[var(--rr-muted)] text-11px leading-none">自定义</span>
      </div>
    </section>

    <label class="relative mx-16px mb-14px block">
      <span class="i-carbon:search absolute left-12px top-1/2 h-15px w-15px color-[var(--rr-muted)] -translate-y-1/2" />
      <input
        v-model="search"
        class="rr-input pl-36px leading-[1.4]"
        placeholder="搜索名称或域名"
      >
    </label>

    <div class="flex items-center justify-between px-22px pb-8px color-[var(--rr-muted)] text-11px font-650 leading-[1.35]">
      <span>规则库</span>
      <span>{{ entries.length }} / {{ stats.total }}</span>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-7px overflow-y-auto px-10px pb-12px">
      <div v-if="entries.length === 0" class="m-18px mx-8px border border-dashed border-[var(--rr-line-strong)] rounded-8px px-12px py-22px color-[var(--rr-muted)] text-center text-13px">
        无匹配规则
      </div>

      <button
        v-for="{ rule, isBuiltin } in entries"
        :key="rule.id"
        type="button"
        class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-12px border border-transparent rounded-8px bg-transparent px-11px py-11px pl-12px color-inherit text-left cursor-pointer transition-[background-color,border-color,transform] duration-140 ease-out hover:border-[var(--rr-line)] hover:bg-[var(--rr-panel-muted)]"
        :class="{
          'border-[var(--rr-green-line)] bg-[var(--rr-green-soft)]': activeId === rule.id,
          'opacity-52': !rule.enabled,
        }"
        @click="emit('select', rule.id)"
      >
        <span class="min-w-0">
          <span class="block overflow-hidden color-[var(--rr-ink)] text-14px font-620 leading-[1.45] tracking-0 text-ellipsis whitespace-nowrap">{{ rule.name }}</span>
          <span class="rr-mono mt-3px block overflow-hidden color-[var(--rr-muted)] text-11px leading-[1.45] text-ellipsis whitespace-nowrap">{{ rule.domain }}</span>
        </span>
        <span class="flex flex-col items-end gap-6px">
          <ModeBadge :mode="rule.mode" short />
          <span v-if="isBuiltin" class="color-[var(--rr-muted)] text-11px leading-none">内置</span>
        </span>
      </button>
    </div>

    <footer class="border-t border-[var(--rr-line)] px-16px pb-16px pt-12px">
      <button type="button" class="rr-button rr-button-primary w-full" @click="emit('add')">
        <span class="i-carbon:add" />
        <span>新建规则</span>
      </button>
    </footer>
  </aside>
</template>
