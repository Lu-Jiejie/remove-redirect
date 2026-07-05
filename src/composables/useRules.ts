import type { Rule } from '~/types/rules'
import { ref, watch } from 'vue'
import browser from 'webextension-polyfill'
import { builtinRules } from '~/rules/builtin'

const STORAGE_KEY = 'remove-redirect:user-rules'
const SETTINGS_KEY = 'remove-redirect:settings'

/** 用户规则（可从 storage 读写） */
const userRules = ref<Rule[]>([])

/** 全局设置 */
const settings = ref({ enabled: true })

/** 加载用户规则 */
async function loadUserRules() {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEY)
    if (stored[STORAGE_KEY]) {
      userRules.value = JSON.parse(stored[STORAGE_KEY] as string)
    }
  }
  catch { /* first run */ }
}

/** 保存用户规则 */
async function saveUserRules() {
  await browser.storage.local.set({ [STORAGE_KEY]: JSON.stringify(userRules.value) })
}

/** 加载设置 */
async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(SETTINGS_KEY)
    if (stored[SETTINGS_KEY]) {
      settings.value = JSON.parse(stored[SETTINGS_KEY] as string)
    }
  }
  catch { /* first run */ }
}

/** 保存设置 */
async function saveSettings() {
  await browser.storage.local.set({ [SETTINGS_KEY]: JSON.stringify(settings.value) })
}

/** 合并后的完整规则列表（内置 + 用户，内置不可编辑） */
const allRules = ref<{ rule: Rule, isBuiltin: boolean }[]>([])

function refreshAllRules() {
  const builtin = builtinRules.map(r => ({ rule: r, isBuiltin: true }))
  const user = userRules.value.map(r => ({ rule: r, isBuiltin: false }))
  allRules.value = [...builtin, ...user]
}

/** 监视用户规则变化，自动保存并刷新合并列表 */
watch(userRules, () => {
  saveUserRules()
  refreshAllRules()
}, { deep: true })

watch(settings, () => {
  saveSettings()
}, { deep: true })

// ========== CRUD 操作 ==========

function addRule(rule: Rule) {
  userRules.value.push(rule)
}

function updateRule(id: string, updates: Partial<Rule>) {
  const index = userRules.value.findIndex(r => r.id === id)
  if (index !== -1) {
    userRules.value[index] = { ...userRules.value[index], ...updates }
  }
}

function removeRule(id: string) {
  userRules.value = userRules.value.filter(r => r.id !== id)
}

export function useRules() {
  return {
    settings,
    userRules,
    allRules,
    loadUserRules,
    loadSettings,
    addRule,
    updateRule,
    removeRule,
    toggleRule,
    refreshAllRules,
  }
}
