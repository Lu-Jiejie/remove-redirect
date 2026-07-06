import type { Rule } from '~/types/rules'
import browser from 'webextension-polyfill'
import { getFlatBuiltinRules } from '~/rules/builtin'
import { extractUrl, getSearchParamsValue, matchRules, validateUrl } from '~/rules/engine'

/**
 * Remove Redirect — Content Script
 *
 * 核心逻辑：检测当前页面，匹配规则，执行三种策略。
 *
 * 运行在 content script 隔离环境。
 * 如需拦截 window.open，注入 <script> 到页面上下文。
 */

async function getEnabledRules(): Promise<Rule[]> {
  try {
    const [stored, storedSettings] = await Promise.all([
      browser.storage.local.get('remove-redirect:user-rules'),
      browser.storage.local.get('remove-redirect:settings'),
    ])
    const settings = storedSettings['remove-redirect:settings']
      ? JSON.parse(storedSettings['remove-redirect:settings'] as string)
      : { enabled: true }

    if (!settings.enabled)
      return []

    const userRules: Rule[] = stored['remove-redirect:user-rules']
      ? JSON.parse(stored['remove-redirect:user-rules'] as string)
      : []

    return [...getFlatBuiltinRules(), ...userRules].filter(r => r.enabled)
  }
  catch {
    return getFlatBuiltinRules().filter(r => r.enabled)
  }
}

async function main() {
  const allRules = await getEnabledRules()
  const hostname = window.location.hostname
  const matched = matchRules(allRules, hostname)

  if (matched.length === 0)
    return

  // 标记页面已激活
  document.documentElement.dataset.removeredirect = 'active'

  for (const rule of matched) {
    switch (rule.mode) {
      case 'transform':
        handleTransform(rule)
        break
      case 'autojump':
        handleAutoJump(rule)
        break
      case 'rewrite-open':
        injectWindowOpenInterceptor(rule)
        break
    }
  }
}

// ─── Transform: 页面链接转换 ──────────────────────────────

function handleTransform(rule: Rule) {
  const config = rule.transform
  if (!config?.selector)
    return

  // 立即扫描已有元素
  scanElements(config)

  // 防抖监听后续 DOM 变化（避免频繁触发导致卡顿）
  let debounceTimer: number | undefined
  const observer = new MutationObserver(() => {
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => {
      scanElements(config)
    }, 500)
  })

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true })
  }
  else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true })
    })
  }
}

function scanElements(config: NonNullable<Rule['transform']>) {
  const els = document.querySelectorAll<HTMLAnchorElement>(config.selector)
  els.forEach((el) => {
    applyTransform(el, config)
  })
  if (config.fallbackSelector) {
    document.querySelectorAll<HTMLAnchorElement>(config.fallbackSelector).forEach((el) => {
      requestFallback(el)
    })
  }
}

function applyTransform(el: HTMLAnchorElement, config: NonNullable<Rule['transform']>) {
  // 1. 从属性读取
  if (config.attribute) {
    const val = el.getAttribute(config.attribute)
    if (val && validateUrl(val)) {
      el.href = val
      return
    }
  }

  // 2. 从 URL 参数或分隔符提取
  const originUrl = extractUrl(el.href, config)
  if (originUrl) {
    el.href = originUrl
  }
}

/** 兜底：对需要 HTTP 请求的链接进行懒加载解析 */
function requestFallback(el: HTMLAnchorElement) {
  // 使用 IntersectionObserver 懒加载
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        observer.unobserve(el)
        // 通过 background 做 fetch 代理来获取最终 URL
        browser.runtime.sendMessage({
          type: 'FETCH_FALLBACK',
          url: el.href,
        }).then((res: any) => {
          if (res?.finalUrl && res.finalUrl !== el.href && validateUrl(res.finalUrl)) {
            el.href = res.finalUrl
          }
        }).catch(() => { /* ignore */ })
        break
      }
    }
  }, { rootMargin: '200px' })
  observer.observe(el)
}

// ─── AutoJump: 自动跳转中转页面 ───────────────────────────

function handleAutoJump(rule: Rule) {
  const config = rule.autojump
  if (!config)
    return

  // pathPattern 验证
  if (config.pathPattern) {
    try {
      if (!new RegExp(config.pathPattern).test(location.pathname))
        return
    }
    catch {
      return
    }
  }

  // 有点击按钮 → 模拟点击
  if (config.clickSelector) {
    const btn = document.querySelector<HTMLElement>(config.clickSelector)
    if (btn) {
      btn.click()
      return
    }
  }

  // 从 URL 参数提取原始链接
  let originUrl = ''

  if (config.paramKey || config.paramKeys) {
    originUrl = getSearchParamsValue(location.search, (config.paramKey || config.paramKeys)!)
  }

  if (!validateUrl(originUrl) && config.separator) {
    originUrl = location.search.split(config.separator)?.[1]
  }

  // 默认尝试 ?target=
  if (!originUrl) {
    originUrl = getSearchParamsValue(location.search, 'target')
  }

  if (originUrl) {
    const decoded = decodeURIComponent(originUrl)
    if (validateUrl(decoded)) {
      location.replace(decoded)
    }
  }
}

// ─── RewriteOpen: 拦截 window.open ───────────────────────

function injectWindowOpenInterceptor(rule: Rule) {
  const config = rule.rewriteOpen
  if (!config?.matchString)
    return

  const script = document.createElement('script')
  script.id = `rr-script-${rule.id}`
  script.textContent = `
(function() {
  if (window.__rrPatched) return;
  window.__rrPatched = true;
  const origOpen = window.open;
  window.open = function(url, target, features) {
    if (typeof url === 'string' && url.includes(${JSON.stringify(config.matchString)})) {
      try {
        const search = new URL(url).search;
        let originUrl = '';
        const paramKeys = ${JSON.stringify(config.paramKeys || null)};
        const paramKey = ${JSON.stringify(config.paramKey || null)};
        const separator = ${JSON.stringify(config.separator || null)};
        if (separator) {
          originUrl = search.split(separator)[1];
        } else if (paramKeys) {
          const sp = new URLSearchParams(search);
          for (const k of paramKeys) { if (sp.get(k)) { originUrl = sp.get(k); break; } }
        } else if (paramKey) {
          originUrl = new URLSearchParams(search).get(paramKey) || '';
        } else {
          originUrl = new URLSearchParams(search).get('target') || '';
        }
        if (originUrl) {
          url = decodeURIComponent(originUrl);
        }
      } catch(e) {}
    }
    return origOpen.call(this, url, target, features);
  };
})();
`
  document.documentElement.appendChild(script)
  script.remove()
}

// ─── 初始化 ──────────────────────────────────────────────

// DOM 加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
}
else {
  main()
}

// 导出供 background 消息通信
export { getEnabledRules }
