<script setup lang="ts">
import type { RuleGroupEntry, RuleStats } from '~/components/types'
import type { Rule, RuleFormModel, RuleMode } from '~/types/rules'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import GroupForm from '~/components/GroupForm.vue'
import RuleDetail from '~/components/RuleDetail.vue'
import RuleForm from '~/components/RuleForm.vue'
import RuleSidebar from '~/components/RuleSidebar.vue'
import { useRules } from '~/composables/useRules'
import { generateId } from '~/rules/engine'

const {
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
} = useRules()

const selectedGroupId = shallowRef<string | null>(null)
const showGroupForm = shallowRef(false)
const showRuleForm = shallowRef(false)
const editingRuleId = shallowRef<string | null>(null)
const addingToGroupId = shallowRef<string | null>(null)
const searchQuery = shallowRef('')
const form = ref<RuleFormModel>(createEmptyForm())

const globalEnabled = computed({
  get: () => settings.value.enabled,
  set: (enabled: boolean) => {
    settings.value = { ...settings.value, enabled }
  },
})

const stats = computed<RuleStats>(() => {
  const groups = allRuleGroups.value
  const totalRules = allRules.value.length
  const enabledRules = allRules.value.filter(({ rule }) => rule.enabled).length
  return {
    total: totalRules,
    enabled: enabledRules,
    builtin: groups.filter(g => g.isBuiltin).length,
    user: userRules.value.length,
  }
})

const filteredGroups = computed<RuleGroupEntry[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query)
    return allRuleGroups.value

  return allRuleGroups.value.filter(({ group }) =>
    group.name.toLowerCase().includes(query)
    || group.rules.some(r =>
      r.name.toLowerCase().includes(query)
      || r.domain.toLowerCase().includes(query),
    ),
  )
})

const selectedGroup = computed<RuleGroupEntry | null>(() => {
  if (!selectedGroupId.value)
    return null
  return allRuleGroups.value.find(g => g.group.id === selectedGroupId.value) ?? null
})

const isBuiltinGroupSelected = computed(() => {
  const g = selectedGroup.value
  return g !== null && g.isBuiltin
})

function createEmptyForm(): RuleFormModel {
  return {
    name: '', domain: '', isRegex: false, mode: 'transform', enabled: true,
    paramKey: '', paramKeys: '', separator: '', attribute: '',
    selector: '', fallbackSelector: '',
    clickSelector: '', pathPattern: '',
    matchString: '',
  }
}

function ruleToForm(rule: Rule): RuleFormModel {
  return {
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
}

function parseParamKeys(value: string) {
  const keys = value.split(',').map(item => item.trim()).filter(Boolean)
  return keys.length ? keys : undefined
}

function optionalValue(value: string) {
  return value.trim() || undefined
}

function formToRuleBase(model: RuleFormModel) {
  const paramKeys = parseParamKeys(model.paramKeys)
  const paramKey = optionalValue(model.paramKey)
  const separator = optionalValue(model.separator)
  return {
    name: model.name.trim() || model.domain.trim(),
    domain: model.domain.trim(),
    isRegex: model.isRegex,
    enabled: model.enabled,
    mode: model.mode as RuleMode,
    paramKey, paramKeys, separator,
  }
}

function formToRule(): Rule {
  const base = formToRuleBase(form.value)
  const id = generateId()
  if (base.mode === 'transform') {
    return { id, ...base, transform: { selector: form.value.selector.trim(), paramKey: base.paramKey, paramKeys: base.paramKeys, separator: base.separator, attribute: optionalValue(form.value.attribute), fallbackSelector: optionalValue(form.value.fallbackSelector) } }
  }
  if (base.mode === 'autojump') {
    return { id, ...base, autojump: { paramKey: base.paramKey, paramKeys: base.paramKeys, separator: base.separator, clickSelector: optionalValue(form.value.clickSelector), pathPattern: optionalValue(form.value.pathPattern) } }
  }
  return { id, ...base, rewriteOpen: { matchString: form.value.matchString.trim(), paramKey: base.paramKey, paramKeys: base.paramKeys, separator: base.separator } }
}

// ---- Group actions ----

function startCreateGroup() {
  showGroupForm.value = true; showRuleForm.value = false; selectedGroupId.value = null
}

function saveGroup(name: string, domain: string, isRegex: boolean) {
  const gid = createUserGroup(name, domain, isRegex)
  selectedGroupId.value = gid; showGroupForm.value = false
}

function forkBuiltinGroup(groupId: string) {
  const groupEntry = allRuleGroups.value.find(g => g.group.id === groupId)
  if (!groupEntry || !groupEntry.isBuiltin) return
  const { group } = groupEntry
  const gid = createUserGroup(group.name, group.domain ?? '', group.isRegex ?? false)
  for (const rule of group.rules) {
    addRule({ ...rule, id: generateId(), groupId: gid })
  }
  selectedGroupId.value = gid
}

function deleteSelectedGroup() {
  if (!selectedGroupId.value || isBuiltinGroupSelected.value) return
  if (!confirm('确定删除此规则组及其所有规则？')) return
  deleteUserGroup(selectedGroupId.value)
  selectedGroupId.value = null
}

// ---- Rule actions ----

function startAddRule() {
  if (!selectedGroupId.value) return
  form.value = createEmptyForm()
  editingRuleId.value = null
  addingToGroupId.value = selectedGroupId.value
  showRuleForm.value = true
}

function startEditRule(ruleId: string) {
  const rule = userRules.value.find(r => r.id === ruleId)
  if (!rule) return
  form.value = ruleToForm(rule)
  editingRuleId.value = ruleId
  addingToGroupId.value = rule.groupId ?? null
  showRuleForm.value = true
}

function cancelForm() {
  showGroupForm.value = false; showRuleForm.value = false
  editingRuleId.value = null; addingToGroupId.value = null
}

function saveRule() {
  if (editingRuleId.value) {
    const model = form.value
    const base = formToRuleBase(model)
    const id = editingRuleId.value
    let update: Partial<Rule>
    if (base.mode === 'transform') {
      update = { ...base, transform: { selector: model.selector.trim(), paramKey: base.paramKey, paramKeys: base.paramKeys, separator: base.separator, attribute: optionalValue(model.attribute), fallbackSelector: optionalValue(model.fallbackSelector) } }
    } else if (base.mode === 'autojump') {
      update = { ...base, autojump: { paramKey: base.paramKey, paramKeys: base.paramKeys, separator: base.separator, clickSelector: optionalValue(model.clickSelector), pathPattern: optionalValue(model.pathPattern) } }
    } else {
      update = { ...base, rewriteOpen: { matchString: model.matchString.trim(), paramKey: base.paramKey, paramKeys: base.paramKeys, separator: base.separator } }
    }
    updateRule(id, update)
    editingRuleId.value = null
  } else {
    addRule({ ...formToRule(), groupId: addingToGroupId.value ?? undefined })
  }
  showRuleForm.value = false; addingToGroupId.value = null
}

function deleteRule(id: string) {
  if (!confirm('确定删除此规则？')) return
  removeRule(id)
}

function onToggleRule(ruleId: string, enabled: boolean) {
  updateRule(ruleId, { enabled })
}

function onUpdateGroupName(id: string, name: string) { updateUserGroup(id, { name }) }
function onUpdateGroupDomain(id: string, domain: string, isRegex: boolean) {
  updateUserGroup(id, { domain, isRegex })
}

function selectGroup(id: string) {
  selectedGroupId.value = id; showGroupForm.value = false; showRuleForm.value = false
}

watch(allRuleGroups, (groups) => {
  if (selectedGroupId.value && !groups.some(g => g.group.id === selectedGroupId.value))
    selectedGroupId.value = null
})

onMounted(loadRulesData)
</script>

<template>
  <main class="font-sans flex min-w-0 bg-[var(--rr-canvas)] color-[var(--rr-ink)] h-screen overflow-hidden max-md:h-auto max-md:overflow-visible max-md:min-h-screen max-md:flex-col">
    <RuleSidebar
      v-model:enabled="globalEnabled"
      v-model:search="searchQuery"
      :active-group-id="selectedGroupId"
      :groups="filteredGroups"
      :stats="stats"
      @add="startCreateGroup"
      @select="selectGroup"
    />

    <OverlayScrollbarsComponent
      tag="section"
      class="min-w-0 flex-1 p-32px max-md:p-18px max-md:overflow-visible"
      :options="{ scrollbars: { autoHide: 'scroll', theme: 'os-theme-rr' }, overflow: { y: 'scroll' } }"
      defer
    >
      <div v-if="!ready" class="grid min-h-420px place-items-center color-[var(--rr-muted)] text-14px">加载中...</div>

      <GroupForm v-else-if="showGroupForm" :existing-groups="userGroupMetas" @cancel="cancelForm" @save="saveGroup" />

      <RuleForm v-else-if="showRuleForm" v-model="form" :is-editing="editingRuleId !== null" @cancel="cancelForm" @save="saveRule" />

      <RuleDetail
        v-else
        :entry="selectedGroup"
        :is-builtin="isBuiltinGroupSelected"
        @add="startAddRule"
        @edit="startEditRule"
        @delete="deleteRule"
        @toggle="onToggleRule"
        @delete-group="deleteSelectedGroup"
        @fork="forkBuiltinGroup"
        @update-group-name="onUpdateGroupName"
        @update-group-domain="onUpdateGroupDomain"
      />
    </OverlayScrollbarsComponent>
  </main>
</template>
