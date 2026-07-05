import type { Rule } from '~/types/rules'

/**
 * 格式化域名：去除协议、端口、www 前缀
 */
export function formatHostname(hostname: string): string {
  return hostname.replace(/^www\./, '').toLowerCase()
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
    return rule.domain === formatted || hostname.endsWith(`.${rule.domain}`) || rule.domain.endsWith(`.${formatted}`)
  })
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
