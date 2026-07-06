import type { RuleMode } from '~/types/rules'

export interface RuleModeMeta {
  label: string
  shortLabel: string
  icon: string
}

export const ruleModeMeta: Record<RuleMode, RuleModeMeta> = {
  'transform': {
    label: '链接转换',
    shortLabel: '转换',
    icon: 'i-carbon:link',
  },
  'autojump': {
    label: '自动跳转',
    shortLabel: '跳转',
    icon: 'i-carbon:jump-link',
  },
  'rewrite-open': {
    label: '拦截 window.open',
    shortLabel: '拦截',
    icon: 'i-carbon:window-base',
  },
}

export function getModeLabel(mode: RuleMode) {
  return ruleModeMeta[mode].label
}
