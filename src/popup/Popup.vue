<script setup lang="ts">
import type { ExtensionSettings, Rule } from '~/types/rules'
import { computed, onMounted, ref, shallowRef } from 'vue'
import browser from 'webextension-polyfill'
import AppBrand from '~/components/AppBrand.vue'
import BaseButton from '~/components/BaseButton.vue'
import ModeBadge from '~/components/ModeBadge.vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import { builtinRules } from '~/rules/builtin'
import { matchRules } from '~/rules/engine'

const STORAGE_KEY = 'remove-redirect:user-rules'
const SETTINGS_KEY = 'remove-redirect:settings'

const userRules = ref<Rule[]>([])
const settings = ref<ExtensionSettings>({ enabled: true })
const currentHostname = shallowRef('')
const loading = shallowRef(true)

const allEnabledRules = computed<Rule[]>(() => {
  return [...builtinRules, ...userRules.value].filter(rule => rule.enabled)
})

const matchedRules = computed(() => {
  if (!currentHostname.value)
    return []
  return matchRules(allEnabledRules.value, currentHostname.value)
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
      browser.storage.local.get([STORAGE_KEY, SETTINGS_KEY]),
      browser.tabs.query({ active: true, currentWindow: true }),
    ])

    if (stored[STORAGE_KEY])
      userRules.value = JSON.parse(stored[STORAGE_KEY] as string)
    if (stored[SETTINGS_KEY])
      settings.value = { enabled: true, ...JSON.parse(stored[SETTINGS_KEY] as string) }
    if (tabs[0]?.url)
      currentHostname.value = new URL(tabs[0].url).hostname
  }
  catch {
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
    <header class="flex items-center justify-between gap-12px border-b border-[var(--rr-line)] bg-[var(--rr-sidebar)] p-16px">
      <AppBrand compact />
      <ThemeToggle />
    </header>

    <section v-if="loading" class="grid min-h-180px place-items-center color-[var(--rr-muted)] text-13px">
      加载中...
    </section>

    <template v-else>
      <section class="mx-12px mt-12px flex items-center justify-between rounded-8px bg-[var(--rr-panel)] px-14px py-12px">
        <span class="text-16px font-700 leading-none tracking-0" :class="settings.enabled ? 'color-[var(--rr-green-text)]' : 'color-[var(--rr-orange-text)]'">
          {{ statusText }}
        </span>
        <ToggleSwitch v-model="globalEnabled" size="sm" label="切换全局引擎" />
      </section>

      <section class="border border-[var(--rr-line)] rounded-8px bg-[var(--rr-panel)] mx-12px mt-12px p-12px">
        <div class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">
          当前页面
        </div>
        <div class="mt-8px flex min-w-0 items-center gap-8px">
          <span class="i-carbon:globe h-15px w-15px flex-none color-[var(--rr-muted)]" />
          <span class="font-mono overflow-hidden color-[var(--rr-ink)] text-12px leading-[1.45] text-ellipsis whitespace-nowrap">{{ currentHostname || '未知页面' }}</span>
        </div>
      </section>

      <section class="border border-[var(--rr-line)] rounded-8px bg-[var(--rr-panel)] mx-12px mt-12px p-12px">
        <div class="flex items-center justify-between color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">
          <span>匹配规则</span>
          <span>{{ matchedRules.length }}</span>
        </div>

        <div v-if="matchedRules.length === 0" class="px-0 pb-2px pt-10px color-[var(--rr-subtle)] text-13px leading-[1.45]">
          当前页面没有匹配规则
        </div>

        <div v-for="rule in matchedRules" :key="rule.id" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-10px border-t border-[var(--rr-line)] py-9px">
          <div class="min-w-0">
            <span class="block overflow-hidden color-[var(--rr-ink)] text-13px font-620 leading-[1.45] tracking-0 text-ellipsis whitespace-nowrap">{{ rule.name }}</span>
            <span class="font-mono mt-2px block overflow-hidden color-[var(--rr-muted)] text-11px leading-[1.4] text-ellipsis whitespace-nowrap">{{ rule.domain }}</span>
          </div>
          <ModeBadge :mode="rule.mode" short />
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
