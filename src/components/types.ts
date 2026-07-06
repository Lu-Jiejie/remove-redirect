import type { Rule, RuleGroup } from '~/types/rules'

export interface RuleListEntry {
  rule: Rule
  isBuiltin: boolean
}

export interface RuleGroupEntry {
  group: RuleGroup
  isBuiltin: boolean
}

export interface RuleStats {
  total: number
  enabled: number
  builtin: number
  user: number
}
