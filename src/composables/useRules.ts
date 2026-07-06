import type { RuleListEntry } from '~/components/types'
import type { ExtensionSettings, Rule } from '~/types/rules'
import { computed, ref, watch } from 'vue'
import browser from 'webextension-polyfill'
import { builtinRules } from '~/rules/builtin'

const STORAGE_KEY = 'remove-redirect:user-rules'
const SETTINGS_KEY = 'remove-redirect:settings'

const defaultSettings: ExtensionSettings = { enabled: true }

const userRules = ref<Rule[]>([])
const settings = ref<ExtensionSettings>({ ...defaultSettings })
const ready = ref(false)

const allRules = computed<RuleListEntry[]>(() => {
  const builtin = builtinRules.map(rule => ({ rule, isBuiltin: true }))
  const user = userRules.value.map(rule => ({ rule, isBuiltin: false }))
  return [...builtin, ...user]
})

async function loadRulesData() {
  try {
    const stored = await browser.storage.local.get([STORAGE_KEY, SETTINGS_KEY])

    if (stored[STORAGE_KEY])
      userRules.value = JSON.parse(stored[STORAGE_KEY] as string)

    if (stored[SETTINGS_KEY])
      settings.value = { ...defaultSettings, ...JSON.parse(stored[SETTINGS_KEY] as string) }
  }
  catch {
    userRules.value = []
    settings.value = { ...defaultSettings }
  }
  finally {
    ready.value = true
  }
}

async function saveUserRules() {
  await browser.storage.local.set({ [STORAGE_KEY]: JSON.stringify(userRules.value) })
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
  if (!rule)
    return

  updateRule(id, { enabled: !rule.enabled })
}

watch(userRules, () => {
  if (ready.value)
    saveUserRules()
}, { deep: true })

watch(settings, () => {
  if (ready.value)
    saveSettings()
}, { deep: true })

export function useRules() {
  return {
    ready,
    settings,
    userRules,
    allRules,
    loadRulesData,
    addRule,
    updateRule,
    removeRule,
    toggleRule,
  }
}
