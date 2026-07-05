<script setup lang="ts">
import type { Rule, RuleFormModel, RuleMode } from '~/types/rules'
import { computed, onMounted, ref } from 'vue'
import browser from 'webextension-polyfill'
import { builtinRules } from '~/rules/builtin'
import { generateId } from '~/rules/engine'

// ===== 状态 =====
const STORAGE_KEY = 'remove-redirect:user-rules'
const SETTINGS_KEY = 'remove-redirect:settings'

const userRules = ref<Rule[]>([])
const settings = ref({ enabled: true })
const editingId = ref<string | null>(null)
const showAddForm = ref(false)
const searchQuery = ref('')

const formDefaults: RuleFormModel = {
  name: '',
  domain: '',
  isRegex: false,
  mode: 'transform',
  enabled: true,
  paramKey: '',
  paramKeys: '',
  separator: '',
  attribute: '',
  selector: '',
  fallbackSelector: '',
  clickSelector: '',
  pathPattern: '',
  matchString: '',
}
const form = ref<RuleFormModel>({ ...formDefaults })

// ===== 计算属性 =====
const allRules = computed<{ rule: Rule, isBuiltin: boolean }[]>(() => {
  const builtin = builtinRules.map(r => ({ rule: r, isBuiltin: true }))
  const user = userRules.value.map(r => ({ rule: r, isBuiltin: false }))
  return [...builtin, ...user]
})

const editingRule = computed(() => {
  if (!editingId.value)
    return null
  for (const r of allRules.value) {
    if (r.rule.id === editingId.value)
      return r
  }
  return null
})

const statsText = computed(() => {
  const total = allRules.value.length
  const enabled = allRules.value.filter(r => r.rule.enabled).length
  const user = userRules.value.length
  return `共 ${total} 条规则（${enabled} 启用，${user} 条自定义）`
})

const filteredRules = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return allRules.value
  return allRules.value.filter(({ rule }) => {
    return rule.name.toLowerCase().includes(q)
      || rule.domain.toLowerCase().includes(q)
  })
})

// ===== 方法 =====
async function loadData() {
  try {
    const stored = await browser.storage.local.get([STORAGE_KEY, SETTINGS_KEY])
    if (stored[STORAGE_KEY])
      userRules.value = JSON.parse(stored[STORAGE_KEY] as string)
    if (stored[SETTINGS_KEY])
      settings.value = JSON.parse(stored[SETTINGS_KEY] as string)
  }
  catch { /* ignore */ }
}

async function saveUserRules() {
  await browser.storage.local.set({ [STORAGE_KEY]: JSON.stringify(userRules.value) })
}

async function saveSettings() {
  await browser.storage.local.set({ [SETTINGS_KEY]: JSON.stringify(settings.value) })
}

function toggleEnabled() {
  settings.value.enabled = !settings.value.enabled
  saveSettings()
}

function editRule(id: string) {
  for (const r of allRules.value) {
    if (r.rule.id === id) {
      editingId.value = id
      showAddForm.value = false
      // 填充表单
      const rule = r.rule
      form.value = {
        name: rule.name,
        domain: rule.domain,
        isRegex: rule.isRegex,
        mode: rule.mode,
        enabled: rule.enabled,
        paramKey: rule.transform?.paramKey || rule.autojump?.paramKey || rule.rewriteOpen?.paramKey || '',
        paramKeys: rule.transform?.paramKeys?.join(', ') || rule.autojump?.paramKeys?.join(', ') || rule.rewriteOpen?.paramKeys?.join(', ') || '',
        separator: rule.transform?.separator || rule.autojump?.separator || rule.rewriteOpen?.separator || '',
        attribute: rule.transform?.attribute || '',
        selector: rule.transform?.selector || '',
        fallbackSelector: rule.transform?.fallbackSelector || '',
        clickSelector: rule.autojump?.clickSelector || '',
        pathPattern: rule.autojump?.pathPattern || '',
        matchString: rule.rewriteOpen?.matchString || '',
      }
      return
    }
  }
}

function startAdd() {
  showAddForm.value = true
  editingId.value = null
  form.value = { ...formDefaults, mode: 'transform', enabled: true }
}

function cancelEdit() {
  showAddForm.value = false
  editingId.value = null
}

function formToRule(): Rule {
  const id = editingId.value || generateId()
  const base = {
    id,
    name: form.value.name || form.value.domain,
    domain: form.value.domain,
    isRegex: form.value.isRegex,
    enabled: form.value.enabled,
    mode: form.value.mode as RuleMode,
  }
  const paramKeys = form.value.paramKeys
    ? form.value.paramKeys.split(',').map(s => s.trim()).filter(Boolean)
    : undefined
  const paramKey = form.value.paramKey || undefined
  const separator = form.value.separator || undefined

  // 构建模式特定配置
  if (form.value.mode === 'transform') {
    return {
      ...base,
      transform: {
        selector: form.value.selector,
        paramKey,
        paramKeys: paramKeys && paramKeys.length ? paramKeys : undefined,
        separator,
        attribute: form.value.attribute || undefined,
        fallbackSelector: form.value.fallbackSelector || undefined,
      },
    }
  }
  if (form.value.mode === 'autojump') {
    return {
      ...base,
      autojump: {
        paramKey,
        paramKeys: paramKeys && paramKeys.length ? paramKeys : undefined,
        separator,
        clickSelector: form.value.clickSelector || undefined,
        pathPattern: form.value.pathPattern || undefined,
      },
    }
  }
  // rewrite-open
  return {
    ...base,
    rewriteOpen: {
      matchString: form.value.matchString,
      paramKey,
      paramKeys: paramKeys && paramKeys.length ? paramKeys : undefined,
      separator,
    },
  }
}

function saveRule() {
  const rule = formToRule()
  if (editingId.value) {
    const idx = userRules.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) {
      userRules.value[idx] = rule
    }
  }
  else {
    userRules.value.push(rule)
  }
  saveUserRules()
  cancelEdit()
}

function deleteRule(id: string) {
  // eslint-disable-next-line no-alert
  if (confirm('确定删除此规则？')) {
    userRules.value = userRules.value.filter(r => r.id !== id)
    saveUserRules()
    if (editingId.value === id)
      cancelEdit()
  }
}

function getModeLabel(mode: RuleMode): string {
  const map: Record<RuleMode, string> = {
    'transform': '链接转换',
    'autojump': '自动跳转',
    'rewrite-open': '拦截 window.open',
  }
  return map[mode]
}

function getModeColor(mode: RuleMode): string {
  const map: Record<RuleMode, string> = {
    'transform': 'bg-blue-100 text-blue-700',
    'autojump': 'bg-green-100 text-green-700',
    'rewrite-open': 'bg-purple-100 text-purple-700',
  }
  return map[mode]
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <main class="h-screen flex overflow-hidden bg-gray-50 text-gray-800">
    <!-- 侧边栏 -->
    <aside class="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <!-- 头部 -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-lg font-bold flex items-center gap-2">
            <span class="i-carbon:shield-check w-5 h-5 text-green-500" />
            Remove Redirect
          </h1>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>{{ statsText }}</span>
        </div>
      </div>

      <!-- 全局开关 -->
      <div class="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <span class="text-sm font-medium">全局启用</span>
        <button
          class="relative w-10 h-5 rounded-full transition-colors"
          :class="settings.enabled ? 'bg-green-500' : 'bg-gray-300'"
          @click="toggleEnabled"
        >
          <span
            class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
            :class="settings.enabled ? 'translate-x-5' : 'translate-x-0.5'"
          />
        </button>
      </div>

      <!-- 规则搜索 -->
      <div class="px-4 py-2 border-b border-gray-100">
        <div class="relative">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 i-carbon:search w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="searchQuery"
            class="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none placeholder-gray-400"
            placeholder="搜索规则名称或域名..."
          >
        </div>
      </div>

      <!-- 规则列表 -->
      <div class="flex-1 overflow-y-auto">
        <div class="px-3 py-2 text-xs text-gray-400 font-medium flex items-center justify-between">
          <span>规则列表</span>
          <span class="text-gray-300">{{ filteredRules.length }} / {{ allRules.length }}</span>
        </div>
        <div v-if="filteredRules.length === 0 && searchQuery.trim()" class="px-4 py-6 text-center text-xs text-gray-300">
          无匹配规则
        </div>
        <div v-for="{ rule } in filteredRules" :key="rule.id">
          <div
            class="mx-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm"
            :class="[
              editingId === rule.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent',
              !rule.enabled ? 'opacity-50' : '',
            ]"
            @click="editRule(rule.id)"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium truncate">{{ rule.name }}</span>
              <span class="text-xs px-1.5 py-0.5 rounded shrink-0" :class="getModeColor(rule.mode)">
                {{ getModeLabel(rule.mode) }}
              </span>
            </div>
            <div class="text-xs text-gray-400 mt-0.5 truncate">
              {{ rule.domain }}
            </div>
          </div>
        </div>
      </div>

      <!-- 添加按钮 -->
      <div class="p-3 border-t border-gray-100">
        <button
          class="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          @click="startAdd"
        >
          <span class="i-carbon:add w-4 h-4" />
          添加规则
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <section class="flex-1 overflow-y-auto p-6">
      <!-- 欢迎/提示 -->
      <div v-if="!editingRule && !showAddForm" class="text-center py-20 text-gray-400">
        <span class="i-carbon:rules w-16 h-16 inline-block mb-4 opacity-30" />
        <p class="text-lg">
          选择左侧规则查看详情，或点击"添加规则"新建
        </p>
      </div>

      <!-- 编辑/查看规则 -->
      <div v-if="editingRule && !showAddForm" class="max-w-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">
            {{ editingRule.rule.name }}
          </h2>
          <div class="flex items-center gap-2">
            <span v-if="editingRule.isBuiltin" class="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">内置规则</span>
            <button
              v-if="!editingRule.isBuiltin"
              class="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              @click="deleteRule(editingRule.rule.id)"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 规则表单 -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">域名</label>
              <div class="text-sm font-mono bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {{ editingRule.rule.domain }}
                <span v-if="editingRule.rule.isRegex" class="text-xs text-orange-500 ml-1">(正则)</span>
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">模式</label>
              <div class="text-sm px-3 py-2 rounded-md border border-gray-200" :class="getModeColor(editingRule.rule.mode)">
                {{ getModeLabel(editingRule.rule.mode) }}
              </div>
            </div>
          </div>

          <!-- 通用 URL 提取配置 -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">
              URL 提取配置
            </h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div v-if="editingRule.rule.transform?.selector || editingRule.rule.rewriteOpen?.matchString">
                <label class="text-gray-400 block">选择器 / 匹配串</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ editingRule.rule.transform?.selector || editingRule.rule.rewriteOpen?.matchString }}</code>
              </div>
              <div v-if="editingRule.rule.transform?.paramKey || editingRule.rule.autojump?.paramKey || editingRule.rule.rewriteOpen?.paramKey">
                <label class="text-gray-400 block">参数名</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ editingRule.rule.transform?.paramKey || editingRule.rule.autojump?.paramKey || editingRule.rule.rewriteOpen?.paramKey }}</code>
              </div>
              <div v-if="editingRule.rule.transform?.paramKeys?.length || editingRule.rule.autojump?.paramKeys?.length">
                <label class="text-gray-400 block">参数名数组</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ (editingRule.rule.transform?.paramKeys || editingRule.rule.autojump?.paramKeys || editingRule.rule.rewriteOpen?.paramKeys)?.join(', ') }}</code>
              </div>
              <div v-if="editingRule.rule.transform?.attribute">
                <label class="text-gray-400 block">DOM 属性</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ editingRule.rule.transform?.attribute }}</code>
              </div>
              <div v-if="editingRule.rule.transform?.fallbackSelector">
                <label class="text-gray-400 block">兜底选择器</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ editingRule.rule.transform?.fallbackSelector }}</code>
              </div>
              <div v-if="editingRule.rule.autojump?.clickSelector">
                <label class="text-gray-400 block">点击按钮</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ editingRule.rule.autojump?.clickSelector }}</code>
              </div>
              <div v-if="editingRule.rule.autojump?.pathPattern">
                <label class="text-gray-400 block">路径模式</label>
                <code class="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">{{ editingRule.rule.autojump?.pathPattern }}</code>
              </div>
            </div>
          </div>

          <!-- 编辑模式 -->
          <div v-if="!editingRule.isBuiltin" class="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <p class="text-sm text-yellow-700">
              提示：此为用户自定义规则，如需修改请在添加时确认；编辑已有用户规则需先删除再重新添加。
            </p>
          </div>
        </div>
      </div>

      <!-- 添加表单 -->
      <div v-if="showAddForm" class="max-w-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">
            添加新规则
          </h2>
          <button class="text-sm text-gray-400 hover:text-gray-600" @click="cancelEdit">
            取消
          </button>
        </div>

        <div class="space-y-4">
          <!-- 基本信息 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
              <input v-model="form.name" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none" placeholder="如：知乎">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">域名</label>
              <input v-model="form.domain" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none" placeholder="如：zhihu.com">
            </div>
          </div>

          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.isRegex" type="checkbox" class="rounded border-gray-300">
              域名是正则表达式
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.enabled" type="checkbox" class="rounded border-gray-300">
              启用
            </label>
          </div>

          <!-- 模式选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">规则模式</label>
            <div class="flex gap-3">
              <label class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer" :class="form.mode === 'transform' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'">
                <input v-model="form.mode" type="radio" value="transform" class="sr-only">
                <span class="i-carbon:link w-5 h-5 text-blue-500" />
                <span class="text-sm">链接转换</span>
              </label>
              <label class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer" :class="form.mode === 'autojump' ? 'border-green-400 bg-green-50' : 'border-gray-200'">
                <input v-model="form.mode" type="radio" value="autojump" class="sr-only">
                <span class="i-carbon:jump-link w-5 h-5 text-green-500" />
                <span class="text-sm">自动跳转</span>
              </label>
              <label class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer" :class="form.mode === 'rewrite-open' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'">
                <input v-model="form.mode" type="radio" value="rewrite-open" class="sr-only">
                <span class="i-carbon:window-base w-5 h-5 text-purple-500" />
                <span class="text-sm">拦截 open</span>
              </label>
            </div>
          </div>

          <!-- Transform 字段 -->
          <div v-if="form.mode === 'transform'" class="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 class="text-sm font-medium text-gray-700">
              链接转换配置
            </h3>
            <div>
              <label class="block text-sm text-gray-500 mb-1">CSS 选择器 <span class="text-red-400">*</span></label>
              <input v-model="form.selector" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="如：[href*=&quot;link.zhihu.com/?target=&quot;]">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-500 mb-1">参数名</label>
                <input v-model="form.paramKey" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="target">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">参数名（多个）</label>
                <input v-model="form.paramKeys" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="pfurl, url">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">DOM 属性</label>
                <input v-model="form.attribute" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="mu / data-url">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">分隔符</label>
                <input v-model="form.separator" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="?target=">
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">兜底选择器</label>
              <input v-model="form.fallbackSelector" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="a[href*=...]">
            </div>
          </div>

          <!-- Autojump 字段 -->
          <div v-if="form.mode === 'autojump'" class="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 class="text-sm font-medium text-gray-700">
              自动跳转配置
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-500 mb-1">参数名</label>
                <input v-model="form.paramKey" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="target">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">参数名（多个）</label>
                <input v-model="form.paramKeys" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="pfurl, url">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">点击按钮选择器</label>
                <input v-model="form.clickSelector" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="a.btn-next">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">路径匹配模式</label>
                <input v-model="form.pathPattern" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="/link">
              </div>
            </div>
          </div>

          <!-- RewriteOpen 字段 -->
          <div v-if="form.mode === 'rewrite-open'" class="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 class="text-sm font-medium text-gray-700">
              拦截 window.open 配置
            </h3>
            <div>
              <label class="block text-sm text-gray-500 mb-1">URL 匹配字符串 <span class="text-red-400">*</span></label>
              <input v-model="form.matchString" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="link.csdn.net?target=">
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-sm text-gray-500 mb-1">参数名</label>
                <input v-model="form.paramKey" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="target">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">参数名（多个）</label>
                <input v-model="form.paramKeys" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="pfurl, url">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">分隔符</label>
                <input v-model="form.separator" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-400 outline-none" placeholder="?target=">
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end gap-3 pt-2">
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" @click="cancelEdit">
              取消
            </button>
            <button
              class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
              :disabled="!form.domain || (form.mode === 'transform' && !form.selector) || (form.mode === 'rewrite-open' && !form.matchString)"
              @click="saveRule"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
