import type { Rule } from '~/types/rules'

export interface RuleListEntry {
  rule: Rule
  isBuiltin: boolean
}

export interface RuleStats {
  total: number
  enabled: number
  builtin: number
  user: number
}
