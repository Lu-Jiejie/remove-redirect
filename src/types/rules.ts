/** 规则模式 */
export type RuleMode = 'transform' | 'autojump' | 'rewrite-open'

/** URL 提取配置（三种模式通用） */
export interface UrlExtractConfig {
  /** URL 参数名 */
  paramKey?: string
  /** 多个 URL 参数名（按顺序尝试） */
  paramKeys?: string[]
  /** 分隔符，从 href 中分割提取 URL（如 "?target="） */
  separator?: string
  /** 从 DOM 属性读取 URL（如 "mu"、"data-url"） */
  attribute?: string
}

/** 链接转换模式配置 */
export interface TransformConfig extends UrlExtractConfig {
  /** 链接元素的 CSS 选择器 */
  selector: string
  /** 需要额外解析的链接选择器（兜底） */
  fallbackSelector?: string
}

/** 自动跳转模式配置 */
export interface AutojumpConfig extends UrlExtractConfig {
  /** 点击跳转按钮的选择器 */
  clickSelector?: string
  /** 匹配 pathname 的正则表达式 */
  pathPattern?: string
}

/** 拦截 window.open 模式配置 */
export interface RewriteOpenConfig extends UrlExtractConfig {
  /** URL 需包含此字符串才触发拦截 */
  matchString: string
}

/** 单条规则（取代原油猴脚本的 Site 元组） */
export interface Rule {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 是否启用 */
  enabled: boolean
  /** 域名（支持字符串精确或正则字符串） */
  domain: string
  /** domain 是否为正则表达式 */
  isRegex: boolean
  /** 规则模式 */
  mode: RuleMode
  /** 所属规则组 ID */
  groupId?: string
  /** 链接转换配置（mode 为 'transform' 时必须） */
  transform?: TransformConfig
  /** 自动跳转配置（mode 为 'autojump' 时必须） */
  autojump?: AutojumpConfig
  /** 拦截 window.open 配置（mode 为 'rewrite-open' 时必须） */
  rewriteOpen?: RewriteOpenConfig
}

/** 规则组：将同一站点的相关规则聚合在一起 */
export interface RuleGroup {
  /** 组唯一标识 */
  id: string
  /** 组显示名称 */
  name: string
  /** 关联域名 */
  domain?: string
  /** 组是否启用 */
  enabled: boolean
  /** 组内规则列表 */
  rules: Rule[]
}

/** 用户创建的规则组元数据 */
export interface RuleGroupMeta {
  id: string
  name: string
  domain: string
  enabled: boolean
}

/** 用于 UI 表单的规则编辑模型 */
export interface RuleFormModel {
  name: string
  domain: string
  isRegex: boolean
  mode: RuleMode
  enabled: boolean
  // URL 提取
  paramKey: string
  paramKeys: string
  separator: string
  attribute: string
  // Transform
  selector: string
  fallbackSelector: string
  // Autojump
  clickSelector: string
  pathPattern: string
  // RewriteOpen
  matchString: string
}

/** 扩展设置 */
export interface ExtensionSettings {
  /** 全局启用/禁用 */
  enabled: boolean
}
