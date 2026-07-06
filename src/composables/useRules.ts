import type { RuleGroupEntry, RuleListEntry } from '~/components/types'
import type { ExtensionSettings, Rule, RuleGroupMeta } from '~/types/rules'
import { computed, ref, watch } from 'vue'
import browser from 'webextension-polyfill'
import { builtinRuleGroups, getFlatBuiltinRules } from '~/rules/builtin'

const STORAGE_RULES = 'remove-redirect:user-rules'
const STORAGE_GROUPS = 'remove-redirect:user-groups'
const SETTINGS_KEY = 'remove-redirect:settings'

const defaultSettings: ExtensionSettings = { enabled: true }

const userRules = ref<Rule[]>([])
const userGroupMetas = ref<RuleGroupMeta[]>([])
const settings = ref<ExtensionSettings>({ ...defaultSettings })
const ready = ref(false)

const allRules = computed<RuleListEntry[]>(() => {
  const builtin = getFlatBuiltinRules().map(rule => ({ rule, isBuiltin: true }))
  const user = userRules.value.map(rule => ({ rule, isBuiltin: false }))
  return [...builtin, ...user]
})

const byName = (a: RuleGroupEntry, b: RuleGroupEntry) =>
  a.group.name.localeCompare(b.group.name, 'zh-Hans-CN', { numeric: true })

/** 按组结构组织的完整规则列表 */
const allRuleGroups = computed<RuleGroupEntry[]>(() => {
  const builtin = builtinRuleGroups.map(group => ({ group, isBuiltin: true }))

  // Build user groups from metas, pulling rules by groupId
  const rulesByGroup = new Map<string, Rule[]>()
  for (const rule of userRules.value) {
    const gid = rule.groupId
    if (!gid) continue
    if (!rulesByGroup.has(gid)) rulesByGroup.set(gid, [])
    rulesByGroup.get(gid)!.push(rule)
  }

  const userGroups: RuleGroupEntry[] = userGroupMetas.value.map(meta => ({
    group: {
      id: meta.id,
      name: meta.name,
      domain: meta.domain,
      enabled: meta.enabled,
      rules: rulesByGroup.get(meta.id) ?? [],
    },
    isBuiltin: false,
  }))

  // Orphan user rules (no group meta) become single-rule groups
  const knownIds = new Set(userGroupMetas.value.map(m => m.id))
  const orphanGroups: RuleGroupEntry[] = userRules.value
    .filter(r => r.groupId && !knownIds.has(r.groupId))
    .map(r => ({
      group: { id: `orphan-${r.id}`, name: r.name, enabled: r.enabled, rules: [r] },
      isBuiltin: false,
    }))

  const sortedBuiltin = [...builtin].sort(byName)
  const sortedUser = [...userGroups, ...orphanGroups].sort(byName)
  return [...sortedBuiltin, ...sortedUser]
})

async function loadRulesData() {
  try {
    const stored = await browser.storage.local.get([STORAGE_RULES, STORAGE_GROUPS, SETTINGS_KEY])

    if (stored[STORAGE_GROUPS])
      userGroupMetas.value = JSON.parse(stored[STORAGE_GROUPS] as string)

    if (stored[STORAGE_RULES])
      userRules.value = JSON.parse(stored[STORAGE_RULES] as string)

    if (stored[SETTINGS_KEY])
      settings.value = { ...defaultSettings, ...JSON.parse(stored[SETTINGS_KEY] as string) }

    // Migration: if there are user rules with no groupId, create a group for each
    migrateOrphanRules()
  }
  catch {
    userRules.value = []
    userGroupMetas.value = []
    settings.value = { ...defaultSettings }
  }
  finally {
    ready.value = true
  }
}

function migrateOrphanRules() {
  const knownIds = new Set(userGroupMetas.value.map(m => m.id))
  let changed = false
  for (const rule of userRules.value) {
    if (!rule.groupId) {
      const gid = `user-${rule.id}`
      rule.groupId = gid
      if (!knownIds.has(gid)) {
        userGroupMetas.value.push({ id: gid, name: rule.name, domain: rule.domain, isRegex: rule.isRegex || undefined, enabled: rule.enabled })
        knownIds.add(gid)
      }
      changed = true
    }
  }
  // Only persist if migration happened
}

async function saveUserRules() {
  await browser.storage.local.set({ [STORAGE_RULES]: JSON.stringify(userRules.value) })
}

async function saveUserGroups() {
  await browser.storage.local.set({ [STORAGE_GROUPS]: JSON.stringify(userGroupMetas.value) })
}

async function saveSettings() {
  await browser.storage.local.set({ [SETTINGS_KEY]: JSON.stringify(settings.value) })
}

function addRule(rule: Rule) {
  userRules.value = [...userRules.value, rule]
}

function updateRule(id: string, updates: Partial<Rule>) {
  userRules.value = userRules.value.map(rule =>
    rule.id === id ? { ...rule, ...updates } : rule,
  )
}

function removeRule(id: string) {
  userRules.value = userRules.value.filter(rule => rule.id !== id)
}

function toggleRule(id: string) {
  const rule = userRules.value.find(item => item.id === id)
  if (!rule) return
  updateRule(id, { enabled: !rule.enabled })
}

/** Create a new user rule group and select it */
function createUserGroup(name: string, domain: string, isRegex?: boolean): string {
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  userGroupMetas.value = [...userGroupMetas.value, { id, name, domain, isRegex, enabled: true }]
  return id
}

/** Update user group metadata */
function updateUserGroup(id: string, updates: Partial<RuleGroupMeta>) {
  userGroupMetas.value = userGroupMetas.value.map(g =>
    g.id === id ? { ...g, ...updates } : g,
  )
}

/** Delete a user rule group and all its rules */
function deleteUserGroup(id: string) {
  userGroupMetas.value = userGroupMetas.value.filter(g => g.id !== id)
  userRules.value = userRules.value.filter(r => r.groupId !== id)
}

watch(userRules, () => {
  if (ready.value) saveUserRules()
}, { deep: true })

watch(userGroupMetas, () => {
  if (ready.value) saveUserGroups()
}, { deep: true })

watch(settings, () => {
  if (ready.value) saveSettings()
}, { deep: true })

export function useRules() {
  return {
    ready,
    settings,
    userRules,
    userGroupMetas,
    allRules,
    allRuleGroups,
    loadRulesData,
    addRule,
    updateRule,
    removeRule,
    toggleRule,
    createUserGroup,
    updateUserGroup,
    deleteUserGroup,
  }
}
