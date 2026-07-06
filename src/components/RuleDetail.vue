<script setup lang="ts">
import type { RuleListEntry } from './types'
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'
import ModeBadge from './ModeBadge.vue'

const props = defineProps<{
  entry: RuleListEntry | null
}>()

const emit = defineEmits<{
  add: []
  delete: [id: string]
}>()

interface DetailRow {
  label: string
  value: string
}

const detailRows = computed<DetailRow[]>(() => {
  const rule = props.entry?.rule
  if (!rule)
    return []

  const rows: DetailRow[] = [
    { label: '域名', value: rule.domain },
    { label: '匹配类型', value: rule.isRegex ? '正则表达式' : '域名匹配' },
    { label: '规则状态', value: rule.enabled ? '启用' : '停用' },
    { label: '规则 ID', value: rule.id },
  ]

  if (rule.transform?.selector)
    rows.push({ label: 'CSS 选择器', value: rule.transform.selector })
  if (rule.transform?.attribute)
    rows.push({ label: 'DOM 属性', value: rule.transform.attribute })
  if (rule.transform?.fallbackSelector)
    rows.push({ label: '兜底选择器', value: rule.transform.fallbackSelector })
  if (rule.autojump?.clickSelector)
    rows.push({ label: '点击选择器', value: rule.autojump.clickSelector })
  if (rule.autojump?.pathPattern)
    rows.push({ label: '路径模式', value: rule.autojump.pathPattern })
  if (rule.rewriteOpen?.matchString)
    rows.push({ label: '匹配字符串', value: rule.rewriteOpen.matchString })

  const paramKey = rule.transform?.paramKey || rule.autojump?.paramKey || rule.rewriteOpen?.paramKey
  const paramKeys = rule.transform?.paramKeys || rule.autojump?.paramKeys || rule.rewriteOpen?.paramKeys
  const separator = rule.transform?.separator || rule.autojump?.separator || rule.rewriteOpen?.separator

  if (paramKey)
    rows.push({ label: '参数名', value: paramKey })
  if (paramKeys?.length)
    rows.push({ label: '参数组', value: paramKeys.join(', ') })
  if (separator)
    rows.push({ label: '分隔符', value: separator })

  return rows
})
</script>

<template>
  <section v-if="entry" class="border border-[var(--rr-ink)]/10 rounded-12px bg-[var(--rr-paper)] mx-auto max-w-980px p-34px max-md:p-24px shadow-[0_4px_24px_var(--rr-shadow)]">
    <header class="flex items-start justify-between gap-24px border-b border-[var(--rr-ink)]/10 pb-26px max-md:flex-col">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-10px color-[var(--rr-muted)] text-12px font-600 leading-none">
          <span>{{ entry.isBuiltin ? '内置规则' : '自定义规则' }}</span>
          <span class="h-16px w-1px bg-[var(--rr-ink)]/19" />
          <ModeBadge :mode="entry.rule.mode" />
        </div>
        <h1 class="m-0 mt-14px color-[var(--rr-ink)] text-28px font-700 leading-[1.18] tracking-tight [overflow-wrap:anywhere]">
          {{ entry.rule.name }}
        </h1>
      </div>

      <BaseButton
        v-if="!entry.isBuiltin"
        variant="danger"
        @click="emit('delete', entry.rule.id)"
      >
        <span class="i-carbon:trash-can" />
        <span>删除</span>
      </BaseButton>
    </header>

    <div class="mt-24px grid grid-cols-2 gap-14px max-md:grid-cols-1">
      <article v-for="row in detailRows" :key="`${row.label}:${row.value}`" class="border border-[var(--rr-ink)]/10 rounded-10px bg-[var(--rr-panel)] min-w-0 p-18px transition-[border-color,box-shadow] duration-140 ease-out hover:border-[var(--rr-ink)]/19 hover:shadow-[0_2px_12px_var(--rr-shadow)]">
        <span class="block color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">{{ row.label }}</span>
        <code class="font-mono mt-12px block overflow-hidden color-[var(--rr-ink)] text-15px leading-[1.55] [overflow-wrap:anywhere] text-ellipsis">{{ row.value }}</code>
      </article>
    </div>

    <div v-if="!entry.isBuiltin" class="mt-18px flex items-center gap-10px border border-[var(--rr-orange)]/34 rounded-10px bg-[var(--rr-orange-soft)] px-14px py-12px color-[var(--rr-orange-text)] text-13px">
      <span class="i-carbon:warning-alt h-16px w-16px flex-none" />
      <span>自定义规则当前通过删除后重建来调整配置。</span>
    </div>
  </section>

  <section v-else class="border border-[var(--rr-ink)]/10 rounded-12px bg-[var(--rr-paper)] mx-auto grid min-h-420px max-w-980px place-items-center content-center gap-18px p-34px text-center shadow-[0_4px_24px_var(--rr-shadow)]">
    <span class="i-carbon:rule h-58px w-58px color-[var(--rr-ink)]/19" />
    <div>
      <h1 class="m-0 color-[var(--rr-ink)] text-24px font-700 leading-[1.2] tracking-tight">
        未选择规则
      </h1>
      <p class="mt-8px color-[var(--rr-muted)] text-14px leading-[1.45] max-w-280px">
        从左侧选择一个规则查看详情，或创建一个新规则
      </p>
    </div>
    <BaseButton variant="primary" @click="emit('add')">
      <span class="i-carbon:add" />
      <span>新建规则</span>
    </BaseButton>
  </section>
</template>
