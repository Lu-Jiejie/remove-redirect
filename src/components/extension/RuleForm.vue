<script setup lang="ts">
import type { RuleFormModel, RuleMode } from '~/types/rules'
import { computed } from 'vue'
import { ruleModeMeta } from './ruleUi'

const emit = defineEmits<{
  cancel: []
  save: []
}>()

const form = defineModel<RuleFormModel>({ required: true })

const modes: RuleMode[] = ['transform', 'autojump', 'rewrite-open']

const canSave = computed(() => {
  if (!form.value.domain)
    return false
  if (form.value.mode === 'transform')
    return !!form.value.selector
  if (form.value.mode === 'rewrite-open')
    return !!form.value.matchString
  return true
})

function save() {
  if (canSave.value)
    emit('save')
}
</script>

<template>
  <section class="rr-surface mx-auto max-w-980px p-34px max-md:p-24px">
    <header class="flex items-start justify-between gap-24px border-b border-[var(--rr-line)] pb-24px">
      <div>
        <div class="rr-label">
          自定义规则
        </div>
        <h1 class="m-0 mt-12px color-[var(--rr-ink)] text-28px font-700 leading-[1.18] tracking-0">
          新建规则
        </h1>
      </div>
      <button type="button" class="rr-icon-button" aria-label="关闭表单" @click="emit('cancel')">
        <span class="i-carbon:close" />
      </button>
    </header>

    <div class="border-b border-[var(--rr-line)] py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        基础信息
      </div>
      <div class="grid grid-cols-2 gap-14px max-md:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">规则名称</span>
          <input v-model="form.name" class="rr-input" placeholder="知乎">
        </label>

        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">域名</span>
          <input v-model="form.domain" class="rr-input" placeholder="zhihu.com">
        </label>
      </div>

      <div class="mt-16px flex flex-wrap items-center gap-16px">
        <label class="inline-flex items-center gap-8px color-[var(--rr-ink)] text-13px cursor-pointer">
          <input v-model="form.isRegex" type="checkbox" class="h-16px w-16px accent-[var(--rr-green)]">
          <span>域名为正则</span>
        </label>
        <label class="inline-flex items-center gap-8px color-[var(--rr-ink)] text-13px cursor-pointer">
          <input v-model="form.enabled" type="checkbox" class="h-16px w-16px accent-[var(--rr-green)]">
          <span>启用</span>
        </label>
      </div>
    </div>

    <div class="border-b border-[var(--rr-line)] py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        规则模式
      </div>
      <div class="grid grid-cols-3 gap-10px max-md:grid-cols-1">
        <label
          v-for="mode in modes"
          :key="mode"
          class="rr-panel-muted flex min-w-0 items-center gap-10px p-14px cursor-pointer transition-[background-color,border-color] duration-140 ease-out"
          :class="{ 'border-[var(--rr-green-line)] bg-[var(--rr-green-soft)]': form.mode === mode }"
        >
          <input v-model="form.mode" type="radio" class="sr-only" :value="mode">
          <span class="h-20px w-20px flex-none color-[var(--rr-green)]" :class="ruleModeMeta[mode].icon" />
          <span class="overflow-hidden color-[var(--rr-ink)] text-13px font-650 leading-[1.35] tracking-0 text-ellipsis whitespace-nowrap">{{ ruleModeMeta[mode].label }}</span>
        </label>
      </div>
    </div>

    <div v-if="form.mode === 'transform'" class="border-b border-[var(--rr-line)] py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        链接转换配置
      </div>
      <label class="grid gap-8px">
        <span class="rr-label">CSS 选择器</span>
        <input v-model="form.selector" class="rr-input rr-input-mono" placeholder="[href*=&quot;target=&quot;]">
      </label>

      <div class="mt-14px grid grid-cols-2 gap-14px max-md:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">参数名</span>
          <input v-model="form.paramKey" class="rr-input rr-input-mono" placeholder="target">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">参数组</span>
          <input v-model="form.paramKeys" class="rr-input rr-input-mono" placeholder="pfurl, url">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">DOM 属性</span>
          <input v-model="form.attribute" class="rr-input rr-input-mono" placeholder="data-url">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">分隔符</span>
          <input v-model="form.separator" class="rr-input rr-input-mono" placeholder="?target=">
        </label>
      </div>

      <label class="mt-14px grid gap-8px">
        <span class="rr-label">兜底选择器</span>
        <input v-model="form.fallbackSelector" class="rr-input rr-input-mono" placeholder="a[href*=...]">
      </label>
    </div>

    <div v-if="form.mode === 'autojump'" class="border-b border-[var(--rr-line)] py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        自动跳转配置
      </div>
      <div class="grid grid-cols-2 gap-14px max-md:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">参数名</span>
          <input v-model="form.paramKey" class="rr-input rr-input-mono" placeholder="target">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">参数组</span>
          <input v-model="form.paramKeys" class="rr-input rr-input-mono" placeholder="pfurl, url">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">点击选择器</span>
          <input v-model="form.clickSelector" class="rr-input rr-input-mono" placeholder="a.btn-next">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">路径模式</span>
          <input v-model="form.pathPattern" class="rr-input rr-input-mono" placeholder="/link">
        </label>
      </div>
    </div>

    <div v-if="form.mode === 'rewrite-open'" class="border-b border-[var(--rr-line)] py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        window.open 拦截配置
      </div>
      <label class="grid gap-8px">
        <span class="rr-label">URL 匹配字符串</span>
        <input v-model="form.matchString" class="rr-input rr-input-mono" placeholder="link.csdn.net?target=">
      </label>

      <div class="mt-14px grid grid-cols-3 gap-14px max-lg:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">参数名</span>
          <input v-model="form.paramKey" class="rr-input rr-input-mono" placeholder="target">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">参数组</span>
          <input v-model="form.paramKeys" class="rr-input rr-input-mono" placeholder="pfurl, url">
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="rr-label">分隔符</span>
          <input v-model="form.separator" class="rr-input rr-input-mono" placeholder="?target=">
        </label>
      </div>
    </div>

    <footer class="flex justify-end gap-10px pt-24px">
      <button type="button" class="rr-button" @click="emit('cancel')">
        取消
      </button>
      <button type="button" class="rr-button rr-button-primary" :disabled="!canSave" @click="save">
        <span class="i-carbon:save" />
        <span>保存</span>
      </button>
    </footer>
  </section>
</template>
