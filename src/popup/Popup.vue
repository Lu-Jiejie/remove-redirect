<script setup lang="ts">
import type { Rule } from '~/types/rules'
import { computed, onMounted, ref } from 'vue'
import browser from 'webextension-polyfill'
import { builtinRules } from '~/rules/builtin'
import { matchRules } from '~/rules/engine'

const STORAGE_KEY = 'remove-redirect:user-rules'
const SETTINGS_KEY = 'remove-redirect:settings'

const userRules = ref<Rule[]>([])
const settings = ref({ enabled: true })
const currentHostname = ref('')
const loading = ref(true)

const allRules = computed<Rule[]>(() => {
  return [...builtinRules, ...userRules.value].filter(r => r.enabled)
})

const matchedRules = computed(() => {
  if (!currentHostname.value)
    return []
  return matchRules(allRules.value, currentHostname.value)
})

async function loadData() {
  try {
    const [stored, tabs] = await Promise.all([
      browser.storage.local.get([STORAGE_KEY, SETTINGS_KEY]),
      browser.tabs.query({ active: true, currentWindow: true }),
    ])
    if (stored[STORAGE_KEY])
      userRules.value = JSON.parse(stored[STORAGE_KEY] as string)
    if (stored[SETTINGS_KEY])
      settings.value = JSON.parse(stored[SETTINGS_KEY] as string)
    if (tabs[0]?.url) {
      currentHostname.value = new URL(tabs[0].url).hostname
    }
  }
  catch { /* ignore */ }
  loading.value = false
}

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

function toggleEnabled() {
  settings.value.enabled = !settings.value.enabled
  browser.storage.local.set({ [SETTINGS_KEY]: JSON.stringify(settings.value) })
}

onMounted(loadData)
</script>

<template>
  <main class="w-[320px] bg-white text-gray-800">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="i-carbon:shield-check w-5 h-5 text-green-500" />
        <span class="font-bold text-sm">Remove Redirect</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-6 text-gray-400 text-sm">
      加载中...
    </div>

    <template v-if="!loading">
      <!-- Status -->
      <div class="px-4 py-3 border-b border-gray-50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-400">扩展状态</span>
          <button
            class="relative w-9 h-4.5 rounded-full transition-colors"
            :class="settings.enabled ? 'bg-green-500' : 'bg-gray-300'"
            @click="toggleEnabled"
          >
            <span
              class="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform"
              :class="settings.enabled ? 'translate-x-4.5' : 'translate-x-0.5'"
            />
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="i-carbon:globe w-4 h-4 text-gray-400 shrink-0" />
          <span class="truncate">{{ currentHostname || '未知页面' }}</span>
        </div>
      </div>

      <!-- Matched rules -->
      <div class="px-4 py-3 border-b border-gray-50">
        <div class="text-xs text-gray-400 mb-2">
          当前页面匹配规则
        </div>
        <div v-if="matchedRules.length === 0" class="text-xs text-gray-300 py-1">
          无匹配规则
        </div>
        <div v-for="rule in matchedRules" :key="rule.id" class="flex items-center gap-2 py-1">
          <span class="i-carbon:checkmark w-3.5 h-3.5 text-green-500 shrink-0" />
          <span class="text-xs">{{ rule.name }}</span>
          <span class="text-xs text-gray-400">({{ rule.mode === 'transform' ? '链接转换' : rule.mode === 'autojump' ? '跳转' : '拦截open' }})</span>
        </div>
      </div>

      <!-- Info -->
      <div class="px-4 py-3 text-xs text-gray-400">
        <span>{{ allRules.length }} 条规则已加载</span>
      </div>

      <!-- Actions -->
      <div class="px-4 py-3 flex gap-2">
        <button class="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" @click="openOptionsPage">
          管理规则
        </button>
      </div>
    </template>
  </main>
</template>
