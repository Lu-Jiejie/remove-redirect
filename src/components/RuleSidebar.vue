<script setup lang="ts">
import type { RuleGroupEntry, RuleStats } from './types'
import { computed, ref, watch } from 'vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import AppBrand from './AppBrand.vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import ThemeToggle from './ThemeToggle.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const props = defineProps<{
  groups: RuleGroupEntry[]
  activeGroupId: string | null
  stats: RuleStats
}>()

const emit = defineEmits<{
  add: []
  select: [id: string]
}>()

const search = defineModel<string>('search', { required: true })
const enabled = defineModel<boolean>('enabled', { required: true })

type GroupTab = 'builtin' | 'user'
const activeTab = ref<GroupTab>('builtin')

const builtinGroups = computed(() => props.groups.filter(g => g.isBuiltin))
const userGroups = computed(() => props.groups.filter(g => !g.isBuiltin))
const visibleGroups = computed(() => activeTab.value === 'builtin' ? builtinGroups.value : userGroups.value)

const emptyHint = computed(() => {
  if (search.value.trim())
    return '无匹配规则组'
  return activeTab.value === 'builtin' ? '暂无内置规则组' : '还没有自定义规则组'
})

// 选中项属于哪个分类，就切到对应的标签页，保证选中项始终可见
watch(() => props.activeGroupId, (id) => {
  if (!id)
    return
  const entry = props.groups.find(g => g.group.id === id)
  if (entry)
    activeTab.value = entry.isBuiltin ? 'builtin' : 'user'
})

function requestAdd() {
  activeTab.value = 'user'
  emit('add')
}

function groupStatus(group: RuleGroupEntry['group']) {
  const total = group.rules.length
  const on = group.rules.filter(r => r.enabled).length
  const text = `${on}/${total}`
  if (total === 0)
    return { text: '0/0', label: '无规则', tag: 'border-[var(--rr-line)] bg-[var(--rr-inset)] color-[var(--rr-subtle)]' }
  if (on === total)
    return { text, label: '全部启用', tag: 'border-[var(--rr-green-line)] bg-[var(--rr-green-soft)] color-[var(--rr-green-text)]' }
  if (on > 0)
    return { text, label: '部分启用', tag: 'border-[var(--rr-orange-line)] bg-[var(--rr-orange-soft)] color-[var(--rr-orange-text)]' }
  return { text, label: '全部停用', tag: 'border-[var(--rr-line)] bg-[var(--rr-inset)] color-[var(--rr-subtle)]' }
}
</script>

<template>
  <aside class="flex h-100vh w-356px min-w-300px flex-col border-r border-[var(--rr-line)] bg-[var(--rr-sidebar)] max-md:h-auto max-md:max-h-70vh max-md:w-full max-md:min-w-0 max-md:border-b max-md:border-r-0">
    <header class="flex items-center justify-between gap-14px px-16px pb-16px pt-24px">
      <AppBrand />
      <ThemeToggle />
    </header>

    <section class="rr-tile mx-16px mb-14px flex items-center justify-between px-16px py-13px">
      <span class="text-17px font-700 leading-none tracking-0" :class="enabled ? 'color-[var(--rr-green-text)]' : 'color-[var(--rr-orange-text)]'">
        {{ enabled ? '已启用' : '已暂停' }}
      </span>
      <ToggleSwitch v-model="enabled" label="切换全局引擎" />
    </section>

    <section class="rr-tile mx-16px mb-14px grid grid-cols-3 divide-x divide-[var(--rr-line)]" aria-label="规则统计">
      <div class="min-w-0 px-12px py-11px">
        <span class="block color-[var(--rr-ink)] font-mono text-20px font-650 leading-none tracking-tight">{{ stats.total }}</span>
        <span class="mt-7px block color-[var(--rr-muted)] text-10px font-600 leading-none tracking-wide uppercase">规则</span>
      </div>
      <div class="min-w-0 px-12px py-11px">
        <span class="block color-[var(--rr-green-text)] font-mono text-20px font-650 leading-none tracking-tight">{{ stats.enabled }}</span>
        <span class="mt-7px block color-[var(--rr-muted)] text-10px font-600 leading-none tracking-wide uppercase">启用</span>
      </div>
      <div class="min-w-0 px-12px py-11px">
        <span class="block color-[var(--rr-ink)] font-mono text-20px font-650 leading-none tracking-tight">{{ stats.user }}</span>
        <span class="mt-7px block color-[var(--rr-muted)] text-10px font-600 leading-none tracking-wide uppercase">自定义</span>
      </div>
    </section>

    <label class="relative mx-16px mb-14px block">
      <span class="i-carbon:search absolute left-12px top-1/2 h-15px w-15px color-[var(--rr-muted)] -translate-y-1/2" />
      <BaseInput
        v-model="search"
        class="pl-36px leading-[1.4]"
        placeholder="搜索组名或域名"
      />
    </label>

    <div class="mx-16px mb-10px grid grid-cols-2 gap-2px border border-[var(--rr-line)] rounded-10px bg-[var(--rr-inset)] p-3px" role="tablist" aria-label="规则组分类">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'builtin'"
        class="inline-flex items-center justify-center gap-6px rounded-8px py-7px text-12px font-650 leading-none tracking-0 cursor-pointer transition-[background-color,color,box-shadow] duration-140 ease-out focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-[-2px]"
        :class="activeTab === 'builtin'
          ? 'bg-[var(--rr-panel)] color-[var(--rr-ink)] shadow-[0_1px_3px_var(--rr-shadow)]'
          : 'bg-transparent color-[var(--rr-muted)] hover:color-[var(--rr-ink)]'"
        @click="activeTab = 'builtin'"
      >
        <span class="i-carbon:cube h-13px w-13px flex-none" :class="activeTab === 'builtin' ? 'color-[var(--rr-green-text)]' : ''" />
        <span>内置</span>
        <span class="rounded-full bg-[var(--rr-inset)] px-6px py-1px font-mono text-10px font-650 leading-none tabular-nums" :class="activeTab === 'builtin' ? 'color-[var(--rr-muted)]' : 'color-[var(--rr-subtle)]'">{{ builtinGroups.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'user'"
        class="inline-flex items-center justify-center gap-6px rounded-8px py-7px text-12px font-650 leading-none tracking-0 cursor-pointer transition-[background-color,color,box-shadow] duration-140 ease-out focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-[-2px]"
        :class="activeTab === 'user'
          ? 'bg-[var(--rr-panel)] color-[var(--rr-ink)] shadow-[0_1px_3px_var(--rr-shadow)]'
          : 'bg-transparent color-[var(--rr-muted)] hover:color-[var(--rr-ink)]'"
        @click="activeTab = 'user'"
      >
        <span class="i-carbon:bookmark h-13px w-13px flex-none" :class="activeTab === 'user' ? 'color-[var(--rr-green)]' : ''" />
        <span>自定义</span>
        <span class="rounded-full bg-[var(--rr-inset)] px-6px py-1px font-mono text-10px font-650 leading-none tabular-nums" :class="activeTab === 'user' ? 'color-[var(--rr-muted)]' : 'color-[var(--rr-subtle)]'">{{ userGroups.length }}</span>
      </button>
    </div>

    <OverlayScrollbarsComponent
      class="rr-tile mx-16px mb-16px min-h-0 flex-1 p-6px"
      :options="{ scrollbars: { autoHide: 'scroll', theme: 'os-theme-rr' }, overflow: { y: 'scroll' } }"
      defer
    >
      <div v-if="visibleGroups.length === 0" class="m-12px border border-dashed border-[var(--rr-line-strong)] rounded-10px px-12px py-22px color-[var(--rr-muted)] text-center text-13px">
        {{ emptyHint }}
      </div>

      <ul v-else class="m-0 flex list-none flex-col gap-3px p-0">
        <li v-for="{ group, isBuiltin } in visibleGroups" :key="group.id">
          <button
            type="button"
            class="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-10px border rounded-8px py-10px px-11px color-inherit text-left cursor-pointer transition-[background-color,border-color,box-shadow] duration-140 ease-out focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-[-2px]"
            :class="activeGroupId === group.id
              ? 'border-[var(--rr-green-line)] bg-[var(--rr-green-soft)] shadow-[0_2px_8px_var(--rr-shadow)]'
              : 'border-transparent bg-transparent hover:bg-[var(--rr-item-hover)]'"
            @click="emit('select', group.id)"
          >
            <span class="min-w-0">
              <span class="flex items-center gap-8px">
                <span
                  class="block overflow-hidden text-14px leading-[1.5] tracking-0 text-ellipsis whitespace-nowrap transition-colors duration-140"
                  :class="activeGroupId === group.id ? 'color-[var(--rr-ink)] font-680' : 'color-[var(--rr-muted)] font-600 group-hover:color-[var(--rr-ink)]'"
                >{{ group.name }}</span>
              </span>
              <span class="mt-4px flex items-center gap-7px text-11px leading-[1.45]" :class="activeGroupId === group.id ? 'color-[var(--rr-muted)]' : 'color-[var(--rr-subtle)]'">
                <span class="overflow-hidden text-ellipsis whitespace-nowrap font-mono">{{ group.domain || group.rules[0]?.domain || '未设置域名' }}</span>
                <span v-if="group.isRegex" class="flex-none rounded-full bg-[var(--rr-inset)] px-5px py-1px text-9px font-650 tracking-wide color-[var(--rr-subtle)]">正则</span>
              </span>
            </span>
            <span
              class="inline-flex flex-none items-center border rounded-full px-8px py-3px font-mono text-11px font-650 leading-none tracking-tight tabular-nums"
              :title="groupStatus(group).label"
              :class="groupStatus(group).tag"
            >{{ groupStatus(group).text }}</span>
          </button>
        </li>
      </ul>
    </OverlayScrollbarsComponent>

    <footer class="border-t border-[var(--rr-line)] px-16px pb-16px pt-12px">
      <BaseButton variant="primary" class="w-full gap-8px" @click="requestAdd">
        <span class="i-carbon:add" />
        <span>新建规则组</span>
      </BaseButton>
    </footer>
  </aside>
</template>
