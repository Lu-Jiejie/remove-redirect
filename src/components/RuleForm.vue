<script setup lang="ts">
import type { RuleFormModel, RuleMode } from '~/types/rules'
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
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
  <section class="border border-[var(--rr-ink)]/10 rounded-12px bg-[var(--rr-paper)] mx-auto max-w-980px p-34px max-md:p-24px shadow-[0_4px_24px_var(--rr-shadow)]">
    <header class="flex items-start justify-between gap-24px border-b border-[var(--rr-ink)]/10 pb-24px">
      <div>
        <div class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">
          自定义规则
        </div>
        <h1 class="m-0 mt-12px color-[var(--rr-ink)] text-28px font-700 leading-[1.18] tracking-tight">
          新建规则
        </h1>
      </div>
      <button type="button" class="inline-grid h-36px w-36px flex-none place-items-center border border-[var(--rr-ink)]/10 rounded-8px bg-[var(--rr-control)] color-[var(--rr-muted)] cursor-pointer transition-[background-color,border-color,color,transform] duration-140 ease-out hover:bg-[var(--rr-control-hover)] hover:color-[var(--rr-ink)] hover:border-[var(--rr-ink)]/19 active:scale-[0.92] focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-2" aria-label="关闭表单" @click="emit('cancel')">
        <span class="i-carbon:close" />
      </button>
    </header>

    <div class="border-b border-[var(--rr-ink)]/10 py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        基础信息
      </div>
      <div class="grid grid-cols-2 gap-14px max-md:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">规则名称</span>
          <BaseInput v-model="form.name" placeholder="知乎" />
        </label>

        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">域名</span>
          <BaseInput v-model="form.domain" placeholder="zhihu.com" />
        </label>
      </div>

      <div class="mt-16px flex flex-wrap items-center gap-16px">
        <label class="inline-flex items-center gap-8px color-[var(--rr-ink)] text-13px cursor-pointer select-none">
          <input v-model="form.isRegex" type="checkbox" class="h-16px w-16px accent-[var(--rr-green)]">
          <span>域名为正则</span>
        </label>
        <label class="inline-flex items-center gap-8px color-[var(--rr-ink)] text-13px cursor-pointer select-none">
          <input v-model="form.enabled" type="checkbox" class="h-16px w-16px accent-[var(--rr-green)]">
          <span>启用</span>
        </label>
      </div>
    </div>

    <div class="border-b border-[var(--rr-ink)]/10 py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        规则模式
      </div>
      <div class="grid grid-cols-3 gap-10px max-md:grid-cols-1">
        <label
          v-for="mode in modes"
          :key="mode"
          class="border border-[var(--rr-ink)]/10 rounded-10px bg-[var(--rr-panel-muted)] flex min-w-0 items-center gap-10px p-14px cursor-pointer transition-[background-color,border-color,transform] duration-140 ease-out hover:border-[var(--rr-ink)]/19 active:scale-[0.98]"
          :class="{ 'border-[var(--rr-green)]/34 bg-[var(--rr-green-soft)] shadow-[0_2px_8px_var(--rr-shadow)]': form.mode === mode }"
        >
          <input v-model="form.mode" type="radio" class="sr-only" :value="mode">
          <span class="h-20px w-20px flex-none color-[var(--rr-green)]" :class="ruleModeMeta[mode].icon" />
          <span class="overflow-hidden color-[var(--rr-ink)] text-13px font-650 leading-[1.35] tracking-0 text-ellipsis whitespace-nowrap">{{ ruleModeMeta[mode].label }}</span>
        </label>
      </div>
    </div>

    <div v-if="form.mode === 'transform'" class="border-b border-[var(--rr-ink)]/10 py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        链接转换配置
      </div>
      <label class="grid gap-8px">
        <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">CSS 选择器</span>
        <BaseInput v-model="form.selector" mono placeholder="[href*=&quot;target=&quot;]" />
      </label>

      <div class="mt-14px grid grid-cols-2 gap-14px max-md:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">参数名</span>
          <BaseInput v-model="form.paramKey" mono placeholder="target" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">参数组</span>
          <BaseInput v-model="form.paramKeys" mono placeholder="pfurl, url" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">DOM 属性</span>
          <BaseInput v-model="form.attribute" mono placeholder="data-url" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">分隔符</span>
          <BaseInput v-model="form.separator" mono placeholder="?target=" />
        </label>
      </div>

      <label class="mt-14px grid gap-8px">
        <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">兜底选择器</span>
        <BaseInput v-model="form.fallbackSelector" mono placeholder="a[href*=...]" />
      </label>
    </div>

    <div v-if="form.mode === 'autojump'" class="border-b border-[var(--rr-ink)]/10 py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        自动跳转配置
      </div>
      <div class="grid grid-cols-2 gap-14px max-md:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">参数名</span>
          <BaseInput v-model="form.paramKey" mono placeholder="target" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">参数组</span>
          <BaseInput v-model="form.paramKeys" mono placeholder="pfurl, url" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">点击选择器</span>
          <BaseInput v-model="form.clickSelector" mono placeholder="a.btn-next" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">路径模式</span>
          <BaseInput v-model="form.pathPattern" mono placeholder="/link" />
        </label>
      </div>
    </div>

    <div v-if="form.mode === 'rewrite-open'" class="border-b border-[var(--rr-ink)]/10 py-24px">
      <div class="mb-14px color-[var(--rr-ink)] text-14px font-700 leading-[1.35]">
        window.open 拦截配置
      </div>
      <label class="grid gap-8px">
        <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">URL 匹配字符串</span>
        <BaseInput v-model="form.matchString" mono placeholder="link.csdn.net?target=" />
      </label>

      <div class="mt-14px grid grid-cols-3 gap-14px max-lg:grid-cols-1">
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">参数名</span>
          <BaseInput v-model="form.paramKey" mono placeholder="target" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">参数组</span>
          <BaseInput v-model="form.paramKeys" mono placeholder="pfurl, url" />
        </label>
        <label class="grid min-w-0 gap-8px">
          <span class="color-[var(--rr-muted)] text-12px font-600 leading-[1.35]">分隔符</span>
          <BaseInput v-model="form.separator" mono placeholder="?target=" />
        </label>
      </div>
    </div>

    <footer class="flex justify-end gap-10px pt-24px">
      <BaseButton @click="emit('cancel')">
        取消
      </BaseButton>
      <BaseButton variant="primary" :disabled="!canSave" @click="save">
        <span class="i-carbon:save" />
        <span>保存</span>
      </BaseButton>
    </footer>
  </section>
</template>
