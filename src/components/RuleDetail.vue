<script setup lang="ts">
import type { RuleGroupEntry } from './types'
import { ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import ModeBadge from './ModeBadge.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const props = defineProps<{
  entry: RuleGroupEntry | null
  isBuiltin: boolean
}>()

const emit = defineEmits<{
  add: []
  edit: [ruleId: string]
  delete: [id: string]
  toggle: [ruleId: string, enabled: boolean]
  'delete-group': []
  fork: [groupId: string]
  'update-group-name': [id: string, name: string]
  'update-group-domain': [id: string, domain: string]
}>()

const editingName = ref(false)
const editingDomain = ref(false)
const editNameValue = ref('')
const editDomainValue = ref('')

watch(() => props.entry?.group.id, () => {
  editingName.value = false
  editingDomain.value = false
})

function startEditName() {
  if (!props.entry || props.isBuiltin) return
  editNameValue.value = props.entry.group.name
  editingName.value = true
}

function startEditDomain() {
  if (!props.entry || props.isBuiltin) return
  editDomainValue.value = props.entry.group.domain || ''
  editingDomain.value = true
}

function saveEditName() {
  if (!props.entry || editingName.value === false) return
  const trimmed = editNameValue.value.trim()
  if (trimmed && trimmed !== props.entry.group.name)
    emit('update-group-name', props.entry.group.id, trimmed)
  editingName.value = false
}

function saveEditDomain() {
  if (!props.entry || editingDomain.value === false) return
  const trimmed = editDomainValue.value.trim()
  if (trimmed && trimmed !== (props.entry.group.domain || ''))
    emit('update-group-domain', props.entry.group.id, trimmed)
  editingDomain.value = false
}
</script>

<template>
  <template v-if="entry">
    <div class="border border-[var(--rr-line)] rounded-12px bg-[var(--rr-paper)] mx-auto max-w-980px p-34px max-md:p-24px shadow-[0_4px_24px_var(--rr-shadow)]">
      <!-- 组头部 -->
      <header class="flex items-start justify-between gap-24px border-b border-[var(--rr-line)] pb-26px max-md:flex-col">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-10px color-[var(--rr-muted)] text-12px font-600 leading-none">
            <span>{{ isBuiltin ? '内置规则组' : '自定义规则组' }}</span>
            <span class="h-16px w-1px bg-[var(--rr-line-strong)]" />
            <span>{{ entry.group.rules.length }} 条规则</span>
          </div>

          <!-- 组名称 -->
          <div v-if="!isBuiltin && editingName" class="mt-14px">
            <BaseInput v-model="editNameValue" mono class="text-22px font-700 leading-[1.18]" placeholder="规则组名称" @keyup.enter="saveEditName" @keyup.escape="editingName = false" @blur="saveEditName" />
          </div>
          <h1 v-else class="m-0 mt-14px color-[var(--rr-ink)] text-28px font-700 leading-[1.18] tracking-tight [overflow-wrap:anywhere] cursor-pointer group flex items-center gap-10px" @click="startEditName">
            {{ entry.group.name }}
            <span v-if="!isBuiltin" class="i-carbon:edit h-16px w-16px color-[var(--rr-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-140" />
          </h1>

          <!-- 组域名 -->
          <div v-if="!isBuiltin" class="mt-8px flex items-center gap-8px">
            <div v-if="editingDomain" class="flex-1 max-w-400px">
              <BaseInput v-model="editDomainValue" mono class="text-14px" placeholder="zhihu.com" @keyup.enter="saveEditDomain" @keyup.escape="editingDomain = false" @blur="saveEditDomain" />
            </div>
            <div v-else class="flex items-center gap-8px color-[var(--rr-muted)] text-13px font-mono leading-[1.45] cursor-pointer group" @click="startEditDomain">
              <span class="i-carbon:globe h-15px w-15px flex-none" />
              <span>{{ entry.group.domain || '未设置域名' }}</span>
              <span class="i-carbon:edit h-14px w-14px color-[var(--rr-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-140" />
            </div>
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="flex flex-none items-center gap-8px">
          <BaseButton v-if="!isBuiltin" variant="danger-ghost" class="min-h-34px px-10px text-12px gap-6px" @click="emit('delete-group')">
            <span class="i-carbon:trash-can h-14px w-14px" />
            <span>删除组</span>
          </BaseButton>
          <BaseButton v-if="isBuiltin" variant="default" class="min-h-34px px-12px gap-6px" @click="emit('fork', entry.group.id)">
            <span class="i-carbon:copy h-14px w-14px" />
            <span>复制到自定义</span>
          </BaseButton>
          <BaseButton v-if="!isBuiltin" variant="primary" class="min-h-34px px-12px gap-6px" @click="emit('add')">
            <span class="i-carbon:add h-14px w-14px" />
            <span>添加规则</span>
          </BaseButton>
        </div>
      </header>

      <!-- 规则列表 -->
      <div class="mt-24px">
        <div v-if="entry.group.rules.length === 0" class="border border-dashed border-[var(--rr-line-strong)] rounded-10px px-12px py-28px color-[var(--rr-muted)] text-center text-13px">
          <div class="i-carbon:rule h-40px w-40px mx-auto color-[var(--rr-line-strong)] mb-12px" />
          <p class="m-0">此规则组还没有规则，点击上方按钮添加</p>
        </div>

        <div v-else class="grid gap-10px">
          <article v-for="rule in entry.group.rules" :key="rule.id" class="border border-[var(--rr-line)] rounded-10px bg-[var(--rr-panel)] p-18px transition-[border-color,box-shadow] duration-140 ease-out hover:border-[var(--rr-line-strong)] hover:shadow-[0_2px_12px_var(--rr-shadow)]">
            <div class="flex items-start justify-between gap-14px">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-8px">
                  <h2 class="m-0 color-[var(--rr-ink)] text-16px font-650 leading-[1.35] tracking-0">
                    {{ rule.name }}
                  </h2>
                  <ModeBadge :mode="rule.mode" />
                </div>
                <div class="mt-8px flex items-center gap-8px color-[var(--rr-muted)] text-13px font-mono leading-[1.45]">
                  <span class="i-carbon:globe h-14px w-14px flex-none" />
                  <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ rule.domain }}</span>
                </div>
              </div>

              <!-- 操作栏：开关 + 编辑 + 删除 -->
              <div class="flex flex-none items-center gap-6px">
                <ToggleSwitch
                  v-if="!isBuiltin"
                  :model-value="rule.enabled"
                  size="sm"
                  :label="rule.enabled ? '停用' : '启用'"
                  @update:model-value="emit('toggle', rule.id, $event)"
                />
                <span v-else class="inline-flex items-center gap-4px rounded-4px px-6px py-2px text-11px font-600 leading-none" :class="rule.enabled ? 'color-[var(--rr-green-text)] bg-[var(--rr-green-soft)]' : 'color-[var(--rr-muted)] bg-[var(--rr-panel-muted)]'">
                  {{ rule.enabled ? '启用' : '停用' }}
                </span>

                <button
                  v-if="!isBuiltin"
                  type="button"
                  title="编辑规则"
                  class="inline-grid min-h-30px w-30px place-items-center border-0 rounded-6px bg-transparent color-[var(--rr-muted)] cursor-pointer transition-[background-color,color] duration-140 ease-out hover:bg-[var(--rr-panel-muted)] hover:color-[var(--rr-ink)] active:scale-[0.92]"
                  @click="emit('edit', rule.id)"
                >
                  <span class="i-carbon:edit h-14px w-14px" />
                </button>
                <button
                  v-if="!isBuiltin"
                  type="button"
                  title="删除规则"
                  class="inline-grid min-h-30px w-30px place-items-center border-0 rounded-6px bg-transparent color-[var(--rr-danger-text)] cursor-pointer transition-[background-color,color] duration-140 ease-out hover:bg-[var(--rr-danger-soft)] active:scale-[0.92]"
                  @click="emit('delete', rule.id)"
                >
                  <span class="i-carbon:trash-can h-14px w-14px" />
                </button>
              </div>
            </div>

            <!-- 规则详情行 -->
            <div class="mt-12px grid grid-cols-2 gap-x-14px gap-y-6px max-md:grid-cols-1">
              <template v-if="rule.transform">
                <div class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">选择器：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.transform.selector }}</code>
                </div>
                <div v-if="rule.transform.paramKey" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">参数：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.transform.paramKey }}</code>
                </div>
                <div v-if="rule.transform.attribute" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">属性：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.transform.attribute }}</code>
                </div>
              </template>
              <template v-if="rule.autojump">
                <div v-if="rule.autojump.paramKey" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">参数：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.autojump.paramKey }}</code>
                </div>
                <div v-if="rule.autojump.pathPattern" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">路径：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.autojump.pathPattern }}</code>
                </div>
                <div v-if="rule.autojump.clickSelector" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">点击：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.autojump.clickSelector }}</code>
                </div>
              </template>
              <template v-if="rule.rewriteOpen">
                <div class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">匹配：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.rewriteOpen.matchString }}</code>
                </div>
                <div v-if="rule.rewriteOpen.paramKey" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                  <span class="font-600">参数：</span>
                  <code class="font-mono color-[var(--rr-ink)]">{{ rule.rewriteOpen.paramKey }}</code>
                </div>
              </template>
              <div v-if="rule.isRegex" class="color-[var(--rr-muted)] text-11px font-500 leading-[1.35]">
                <span class="font-600">匹配类型：</span>
                <span>正则表达式</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </template>

  <!-- 空状态 -->
  <section v-else class="border border-[var(--rr-line)] rounded-12px bg-[var(--rr-paper)] mx-auto grid min-h-420px max-w-980px place-items-center content-center gap-18px p-34px text-center shadow-[0_4px_24px_var(--rr-shadow)]">
    <span class="i-carbon:rule h-58px w-58px color-[var(--rr-line-strong)]" />
    <div>
      <h1 class="m-0 color-[var(--rr-ink)] text-24px font-700 leading-[1.2] tracking-tight">未选择规则组</h1>
      <p class="mt-8px color-[var(--rr-muted)] text-14px leading-[1.45] max-w-280px">从左侧选择一个规则组查看详情</p>
    </div>
  </section>
</template>
