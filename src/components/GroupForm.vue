<script setup lang="ts">
import type { RuleGroupMeta } from '~/types/rules'
import { computed, ref } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'

const props = defineProps<{
  existingGroups?: RuleGroupMeta[]
}>()

const emit = defineEmits<{
  cancel: []
  save: [name: string, domain: string]
}>()

const name = ref('')
const domain = ref('')

const domainConflict = computed(() => {
  if (!domain.value.trim() || !props.existingGroups)
    return null
  const match = props.existingGroups.find(
    g => g.domain.toLowerCase() === domain.value.trim().toLowerCase(),
  )
  return match || null
})

function submit() {
  if (!name.value.trim() || !domain.value.trim())
    return
  emit('save', name.value.trim(), domain.value.trim())
}
</script>

<template>
  <section class="rr-card mx-auto max-w-980px p-34px max-md:p-24px">
    <header class="flex items-start justify-between gap-24px pb-24px">
      <div>
        <div class="rr-label">
          自定义规则组
        </div>
        <h1 class="m-0 mt-12px color-[var(--rr-ink)] text-28px font-700 leading-[1.18] tracking-tight">
          新建规则组
        </h1>
      </div>
      <button type="button" class="rr-icon-btn h-36px w-36px flex-none" aria-label="关闭" @click="emit('cancel')">
        <span class="i-carbon:close" />
      </button>
    </header>

    <div class="space-y-16px">
      <label class="grid gap-8px">
        <span class="rr-label">组名称</span>
        <BaseInput
          v-model="name"
          placeholder="知乎"
        />
        <span class="color-[var(--rr-subtle)] text-11px leading-[1.35]">例如 "我的知乎规则"</span>
      </label>

      <label class="grid gap-8px">
        <span class="rr-label">域名</span>
        <BaseInput
          v-model="domain"
          placeholder="zhihu.com"
        />
        <span class="color-[var(--rr-subtle)] text-11px leading-[1.35]">该组关联的主域名</span>
        <div v-if="domainConflict" class="flex items-center gap-6px rounded-6px border border-[var(--rr-orange-line)] bg-[var(--rr-orange-soft)] px-10px py-8px color-[var(--rr-orange-text)] text-12px leading-[1.35]">
          <span class="i-carbon:warning-alt h-14px w-14px flex-none" />
          <span>域名已在规则组「{{ domainConflict.name }}」中使用</span>
        </div>
      </label>
    </div>

    <footer class="flex justify-end gap-10px pt-24px">
      <BaseButton @click="emit('cancel')">
        取消
      </BaseButton>
      <BaseButton variant="primary" :disabled="!name.trim() || !domain.trim()" @click="submit">
        <span class="i-carbon:add" />
        <span>创建规则组</span>
      </BaseButton>
    </footer>
  </section>
</template>
