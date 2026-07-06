<script setup lang="ts">
import type { ExtensionSettings, Rule } from '~/types/rules'
import { computed, onMounted, ref, shallowRef } from 'vue'
import browser from 'webextension-polyfill'
import AppBrand from '~/components/AppBrand.vue'
import BaseButton from '~/components/BaseButton.vue'
import ModeBadge from '~/components/ModeBadge.vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import { builtinRuleGroups, builtinGroupDefs } from '~/rules/builtin'
import { matchRules } from '~/rules/engine'

interface GroupedMatch {
  id: string
  name: string
  isBuiltin: boolean
  rules: Rule[]
}

const STORAGE_RULES = 'remove-redirect:user-rules'
const STORAGE_GROUPS = 'remove-redirect:user-groups'
const SETTINGS_KEY = 'remove-redirect:settings'

const userRules = ref<Rule[]>([])
const userGroupMetas = ref<{ id: string, name: string }[]>([])
const settings = ref<ExtensionSettings>({ enabled: true })
const currentHostname = shallowRef('')
const loading = shallowRef(true)

const allEnabledRules = computed<Rule[]>(() => {
  return [
    ...builtinRuleGroups.flatMap(g => g.rules),
    ...userRules.value,
  ].filter(rule => rule.enabled)
})

const matchedRules = computed(() => {
  if (!currentHostname.value)
    return []
  return matchRules(allEnabledRules.value, currentHostname.value)
})

/** Build a map from rule ID to parent group info */
const ruleToGroupMap = computed(() => {
  const map = new Map<string, { groupId: string, groupName: string, isBuiltin: boolean }>()

  // Built-in groups
  for (const def of builtinGroupDefs) {
    for (const ruleId of def.ruleIds) {
      map.set(ruleId, { groupId: def.id, groupName: def.name, isBuiltin: true })
    }
  }

  // User groups
  for (const meta of userGroupMetas.value) {
    // User rules reference groups via groupId, so we match at the rule level
    // We'll find rules with matching groupId during grouping
  }

  return map
})

/** Group matched rules by their parent group */
const matchedGroups = computed<GroupedMatch[]>(() => {
  const matched = matchedRules.value
  if (matched.length === 0) return []

  const groupMap = new Map<string, GroupedMatch>()
  const ruleToGroup = ruleToGroupMap.value
  const userGroupMap = new Map(userGroupMetas.value.map(m => [m.id, m]))

  for (const rule of matched) {
    let gid: string
    let gName: string
    let isBuiltin: boolean

    const fromBuiltin = ruleToGroup.get(rule.id)
    if (fromBuiltin) {
      gid = fromBuiltin.groupId
      gName = fromBuiltin.groupName
      isBuiltin = true
    } else if (rule.groupId) {
      const userMeta = userGroupMap.get(rule.groupId)
      gid = rule.groupId
      gName = userMeta?.name || rule.name
      isBuiltin = false
    } else {
      gid = `rule-${rule.id}`
      gName = rule.name
      isBuiltin = false
    }

    if (!groupMap.has(gid))
      groupMap.set(gid, { id: gid, name: gName, isBuiltin, rules: [] })
    groupMap.get(gid)!.rules.push(rule)
  }

  return Array.from(groupMap.values())
})

const globalEnabled = computed({
  get: () => settings.value.enabled,
  set: (enabled: boolean) => {
    settings.value = { ...settings.value, enabled }
    saveSettings()
  },
})

const statusText = computed(() => settings.value.enabled ? '已启用' : '已暂停')

async function loadData() {
  try {
    const [stored, tabs] = await Promise.all([
      browser.storage.local.get([STORAGE_RULES, STORAGE_GROUPS, SETTINGS_KEY]),
      browser.tabs.query({ active: true, currentWindow: true }),
    ])

    if (stored[STORAGE_RULES])
      userRules.value = JSON.parse(stored[STORAGE_RULES] as string)
    if (stored[STORAGE_GROUPS])
      userGroupMetas.value = JSON.parse(stored[STORAGE_GROUPS] as string)
    if (stored[SETTINGS_KEY])
      settings.value = { enabled: true, ...JSON.parse(stored[SETTINGS_KEY] as string) }
    if (tabs[0]?.url)
      currentHostname.value = new URL(tabs[0].url).hostname
  }
  catch {
    userRules.value = []
    userGroupMetas.value = []
    currentHostname.value = ''
  }
  finally {
    loading.value = false
  }
}

async function saveSettings() {
  await browser.storage.local.set({ [SETTINGS_KEY]: JSON.stringify(settings.value) })
}

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

onMounted(loadData)
</script>

<template>
  <main class="font-sans min-h-320px w-340px bg-[var(--rr-paper)] color-[var(--rr-ink)]">
    <header class="flex items-center justify-between gap-12px border-b border-[var(--rr-line)] bg-[var(--rr-sidebar)] px-16px py-14px">
      <AppBrand compact />
      <ThemeToggle />
    </header>

    <section v-if="loading" class="grid min-h-180px place-items-center color-[var(--rr-muted)] text-13px">
      加载中...
    </section>

    <template v-else>
      <section class="mx-12px mt-12px flex items-center justify-between rounded-10px border border-[var(--rr-line)] bg-[var(--rr-panel)] px-14px py-12px">
        <span class="text-16px font-700 leading-none tracking-0" :class="settings.enabled ? 'color-[var(--rr-green-text)]' : 'color-[var(--rr-orange-text)]'">
          {{ statusText }}
        </span>
        <ToggleSwitch v-model="globalEnabled" size="sm" label="切换全局引擎" />
      </section>

      <section class="border border-[var(--rr-line)] rounded-10px bg-[var(--rr-panel)] mx-12px mt-12px p-12px">
        <div class="flex items-center justify-between color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">
          <span>匹配规则</span>
          <span class="font-mono text-13px tracking-tight">{{ matchedRules.length }}</span>
        </div>

        <div v-if="matchedRules.length === 0" class="px-0 pb-2px pt-12px color-[var(--rr-subtle)] text-13px leading-[1.45]">
          当前页面没有匹配规则
        </div>

        <!-- 按规则组分组展示 -->
        <div v-for="group in matchedGroups" :key="group.id" class="border-t border-[var(--rr-line)] pt-10px mt-10px first:border-0 first:pt-0 first:mt-0">
          <div class="flex items-center gap-6px mb-6px color-[var(--rr-muted)] text-11px font-600 leading-[1.35]">
            <span>{{ group.name }}</span>
            <span class="color-[var(--rr-subtle)]">·</span>
            <span>{{ group.rules.length }}</span>
          </div>
          <div v-for="rule in group.rules" :key="rule.id" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-10px py-8px pl-10px border-l-2 border-[var(--rr-line-strong)] ml-2px">
            <div class="min-w-0">
              <span class="block overflow-hidden color-[var(--rr-ink)] text-13px font-620 leading-[1.45] tracking-0 text-ellipsis whitespace-nowrap">{{ rule.name }}</span>
              <span class="font-mono mt-2px block overflow-hidden color-[var(--rr-muted)] text-11px leading-[1.4] text-ellipsis whitespace-nowrap">{{ rule.domain }}</span>
            </div>
            <ModeBadge :mode="rule.mode" short />
          </div>
        </div>
      </section>

      <footer class="flex items-center justify-between gap-12px p-12px">
        <span class="min-w-0 color-[var(--rr-muted)] text-12px leading-[1.35]">{{ allEnabledRules.length }} 条规则已加载</span>
        <BaseButton variant="primary" class="min-h-34px flex-none px-12px" @click="openOptionsPage">
          <span>管理规则</span>
        </BaseButton>
      </footer>
    </template>
  </main>
</template>
