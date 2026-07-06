<script setup lang="ts">
import type { RuleListEntry, RuleStats } from '~/components/extension/types'
import type { Rule, RuleFormModel, RuleMode } from '~/types/rules'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import RuleDetail from '~/components/extension/RuleDetail.vue'
import RuleForm from '~/components/extension/RuleForm.vue'
import RuleSidebar from '~/components/extension/RuleSidebar.vue'
import { useRules } from '~/composables/useRules'
import { generateId } from '~/rules/engine'

const {
  ready,
  settings,
  userRules,
  allRules,
  loadRulesData,
  addRule,
  removeRule,
} = useRules()

const selectedId = shallowRef<string | null>(null)
const showAddForm = shallowRef(false)
const searchQuery = shallowRef('')
const form = ref<RuleFormModel>(createEmptyForm())

const globalEnabled = computed({
  get: () => settings.value.enabled,
  set: (enabled: boolean) => {
    settings.value = { ...settings.value, enabled }
  },
})

const stats = computed<RuleStats>(() => {
  const entries = allRules.value
  return {
    total: entries.length,
    enabled: entries.filter(({ rule }) => rule.enabled).length,
    builtin: entries.filter(({ isBuiltin }) => isBuiltin).length,
    user: userRules.value.length,
  }
})

const filteredEntries = computed<RuleListEntry[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query)
    return allRules.value

  return allRules.value.filter(({ rule }) =>
    rule.name.toLowerCase().includes(query)
    || rule.domain.toLowerCase().includes(query),
  )
})

const selectedEntry = computed<RuleListEntry | null>(() => {
  if (!selectedId.value)
    return null
  return allRules.value.find(({ rule }) => rule.id === selectedId.value) ?? null
})

function createEmptyForm(): RuleFormModel {
  return {
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
}

function parseParamKeys(value: string) {
  const keys = value.split(',').map(item => item.trim()).filter(Boolean)
  return keys.length ? keys : undefined
}

function optionalValue(value: string) {
  return value.trim() || undefined
}

function formToRule(): Rule {
  const model = form.value
  const id = generateId()
  const paramKeys = parseParamKeys(model.paramKeys)
  const paramKey = optionalValue(model.paramKey)
  const separator = optionalValue(model.separator)
  const base = {
    id,
    name: model.name.trim() || model.domain.trim(),
    domain: model.domain.trim(),
    isRegex: model.isRegex,
    enabled: model.enabled,
    mode: model.mode as RuleMode,
  }

  if (model.mode === 'transform') {
    return {
      ...base,
      transform: {
        selector: model.selector.trim(),
        paramKey,
        paramKeys,
        separator,
        attribute: optionalValue(model.attribute),
        fallbackSelector: optionalValue(model.fallbackSelector),
      },
    }
  }

  if (model.mode === 'autojump') {
    return {
      ...base,
      autojump: {
        paramKey,
        paramKeys,
        separator,
        clickSelector: optionalValue(model.clickSelector),
        pathPattern: optionalValue(model.pathPattern),
      },
    }
  }

  return {
    ...base,
    rewriteOpen: {
      matchString: model.matchString.trim(),
      paramKey,
      paramKeys,
      separator,
    },
  }
}

function startAdd() {
  form.value = createEmptyForm()
  selectedId.value = null
  showAddForm.value = true
}

function selectRule(id: string) {
  selectedId.value = id
  showAddForm.value = false
}

function cancelForm() {
  showAddForm.value = false
}

function saveRule() {
  const rule = formToRule()
  addRule(rule)
  selectedId.value = rule.id
  showAddForm.value = false
}

function deleteRule(id: string) {
  // eslint-disable-next-line no-alert
  if (!confirm('确定删除此规则？'))
    return

  removeRule(id)
  if (selectedId.value === id)
    selectedId.value = null
}

watch(allRules, (entries) => {
  if (selectedId.value && !entries.some(({ rule }) => rule.id === selectedId.value))
    selectedId.value = null
})

onMounted(loadRulesData)
</script>

<template>
  <main class="font-sans flex min-h-100vh min-w-0 bg-[var(--rr-canvas)] color-[var(--rr-ink)] max-md:flex-col">
    <RuleSidebar
      v-model:enabled="globalEnabled"
      v-model:search="searchQuery"
      :active-id="selectedId"
      :entries="filteredEntries"
      :stats="stats"
      @add="startAdd"
      @select="selectRule"
    />

    <section class="min-w-0 flex-1 overflow-y-auto p-32px max-md:p-18px">
      <div v-if="!ready" class="grid min-h-420px place-items-center color-[var(--rr-muted)] text-14px">
        加载中...
      </div>

      <RuleForm
        v-else-if="showAddForm"
        v-model="form"
        @cancel="cancelForm"
        @save="saveRule"
      />

      <RuleDetail
        v-else
        :entry="selectedEntry"
        @add="startAdd"
        @delete="deleteRule"
      />
    </section>
  </main>
</template>
