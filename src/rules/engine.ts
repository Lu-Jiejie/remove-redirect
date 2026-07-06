import type { Rule, RuleGroup } from '~/types/rules'

/**
 * 格式化域名：去除协议、端口、www 前缀
 */
export function formatHostname(hostname: string): string {
  return hostname.replace(/^www\./, '').toLowerCase()
}

/**
 * 判断普通字符串域名是否匹配当前 hostname
 */
function matchDomain(domain: string, hostname: string, formatted: string): boolean {
  return domain === formatted || hostname.endsWith(`.${domain}`) || domain.endsWith(`.${formatted}`)
}

/**
 * 匹配域名与规则
 */
export function matchRules(rules: Rule[], hostname: string): Rule[] {
  const formatted = formatHostname(hostname)
  return rules.filter((rule) => {
    if (!rule.enabled)
      return false
    if (rule.isRegex) {
      return new RegExp(rule.domain).test(formatted)
    }
    return matchDomain(rule.domain, hostname, formatted)
  })
}

/**
 * 按规则组匹配：优先用 group.domain 命中整组，
 * 未命中再回退到组内逐条规则各自的 domain 匹配。
 * 返回去重后的已启用规则。
 */
export function matchGroups(groups: RuleGroup[], hostname: string): Rule[] {
  const formatted = formatHostname(hostname)
  const seen = new Set<string>()
  const result: Rule[] = []

  for (const group of groups) {
    if (group.enabled === false)
      continue

    // 组域名匹配：支持正则与字符串两种模式
    let groupHit = false
    if (group.domain) {
      groupHit = group.isRegex
        ? new RegExp(group.domain).test(formatted)
        : matchDomain(group.domain, hostname, formatted)
    }

    // 组域名命中 → 该组全部启用规则生效；否则回退逐条匹配
    const rules = groupHit
      ? group.rules.filter(r => r.enabled)
      : matchRules(group.rules, hostname)

    for (const rule of rules) {
      if (seen.has(rule.id))
        continue
      seen.add(rule.id)
      result.push(rule)
    }
  }

  return result
}

/**
 * 获取 URL 参数值（支持多个参数名）
 */
export function getSearchParamsValue(
  search: string | URLSearchParams,
  queryName?: string | string[],
): string {
  if (!queryName)
    return ''
  const sp = new URLSearchParams(search)
  const names = Array.isArray(queryName) ? queryName : [queryName]
  for (const name of names) {
    const val = sp.get(name)
    if (val)
      return val
  }
  return ''
}

/**
 * 验证 URL 合法性
 */
export function validateUrl(url: string): boolean {
  if (!url || url.startsWith('javascript:') || url.startsWith('data:'))
    return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  }
  catch {
    return false
  }
}

/**
 * 提取重定向 URL：根据配置从链接中提取原始 URL
 */
export function extractUrl(
  href: string,
  config: {
    paramKey?: string
    paramKeys?: string[]
    separator?: string
    attribute?: string
  },
): string {
  const { paramKey, paramKeys, separator } = config

  // 1. 尝试从 URL 参数提取
  if (paramKey || paramKeys) {
    const { search } = new URL(href)
    const value = getSearchParamsValue(search, (paramKey || paramKeys)!)
    if (validateUrl(value))
      return value
    if (value)
      return decodeURIComponent(value)
  }

  // 2. 尝试用分隔符提取
  if (separator) {
    const parts = href.split(separator)
    if (parts.length > 1) {
      const value = decodeURIComponent(parts.slice(1).join(separator))
      if (validateUrl(value))
        return value
    }
  }

  // 3. 默认用 ?target= 分隔符
  if (!separator && !paramKey && !paramKeys) {
    const parts = href.split('?target=')
    if (parts.length > 1) {
      const value = decodeURIComponent(parts.slice(1).join('?target='))
      if (validateUrl(value))
        return value
    }
  }

  return ''
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
