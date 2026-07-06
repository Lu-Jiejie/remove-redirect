import type { Tabs } from 'webextension-polyfill'
import { onMessage, sendMessage } from 'webext-bridge/background'
import browser from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  // 首次激活时不处理
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

/**
 * 处理 content script 的 fallback fetch 请求
 * 用于解析需要额外 HTTP 请求才能获取最终 URL 的链接（替代 GM.xmlHttpRequest）
 */
browser.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
  if (message.type === 'FETCH_FALLBACK') {
    fetch(message.url, { method: 'HEAD', redirect: 'follow' })
      .then(res => sendResponse({ finalUrl: res.url }))
      .catch(() => sendResponse({ finalUrl: null }))
    return true // 保持消息通道打开
  }

  sendResponse(undefined)
  return true
})
