import type { Rule, RuleGroup } from '~/types/rules'

/**
 * 内置规则（基于 temp/remove-redirect 移植，结构简化优化）
 *
 * 优化说明：
 * 1. 原油猴脚本的 Site 元组（[name, domain, {transform,autojump,rewriteWindowOpen}]）
 *    改为对象结构，字段直接可读。
 * 2. 三种策略拆为三种 mode，每个 mode 各自的配置集中在对应字段中。
 * 3. 去掉自定义函数（customTransform / getOriginalUrl），仅保留声明式配置。
 *    特殊站点（百度、Bing、Google 等）通过规则中标记处理。
 * 4. 域名匹配用 isRegex 布尔值取代运行时类型检测。
 */

export const builtinRules: Rule[] = [
  // ==================== 知乎 ====================
  //   - https://www.zhihu.com/question/29380608/answer/65298472
  //   - https://zhuanlan.zhihu.com/p/472361432
  //   - https://link.zhihu.com/?target=https%3A%2F%2Ffe-mm.com
  //   - https://link.zhihu.com/?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'zhihu-transform',
    name: '知乎',
    enabled: true,
    domain: 'zhihu.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="link.zhihu.com/?target="]',
    },
  },
  {
    id: 'zhihu-autojump',
    name: '知乎中转页',
    enabled: true,
    domain: 'link.zhihu.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== CSDN ====================
  //   - https://blog.csdn.net/LoseInVain/article/details/122735603
  //   - https://link.csdn.net/?target=https%3A%2F%2Ffe-mm.com
  //   - https://link.csdn.net/?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'csdn-rewrite-open',
    name: 'CSDN',
    enabled: true,
    domain: 'blog.csdn.net',
    isRegex: false,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: 'link.csdn.net?target=',
    },
  },
  {
    id: 'csdn-autojump',
    name: 'CSDN 中转页',
    enabled: true,
    domain: 'link.csdn.net',
    isRegex: false,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== 掘金 ====================
  //   - https://juejin.cn/post/6844903608622956557
  //   - https://link.juejin.cn/?target=https%3A%2F%2Ffe-mm.com
  //   - https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'juejin-transform',
    name: '掘金',
    enabled: true,
    domain: 'juejin.cn',
    isRegex: false,
    mode: 'transform',
    transform: {
      selector: '[href*="link.juejin.cn?target="]',
    },
  },
  {
    id: 'juejin-autojump',
    name: '掘金中转页',
    enabled: true,
    domain: 'link.juejin.cn',
    isRegex: false,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== 简书 ====================
  //   - https://www.jianshu.com/p/28788506c0da
  //   - https://www.jianshu.com/go-wild?ac=2&url=https%3A%2F%2Ffe-mm.com
  //   - https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'jianshu-transform',
    name: '简书',
    enabled: true,
    domain: 'jianshu.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="link.jianshu.com/?t="]',
      paramKey: 't',
    },
  },
  {
    id: 'jianshu-autojump',
    name: '简书中转页',
    enabled: true,
    domain: 'link.jianshu.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKey: 't',
    },
  },

  // ==================== 微博 ====================
  //   - https://weibo.com/u/1400854834
  //   - https://weibo.cn/sinaurl?u=https%3A%2F%2Ffe-mm.com
  //   - https://weibo.cn/sinaurl?u=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'weibo-transform',
    name: '微博',
    enabled: true,
    domain: 'weibo.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="weibo.cn/sinaurl?"]',
      paramKeys: ['u', 'goto'],
    },
  },
  {
    id: 'weibo-autojump',
    name: '微博中转页',
    enabled: true,
    domain: 'weibo.cn',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'u',
    },
  },

  // ==================== 百度搜索 ====================
  //   - https://www.baidu.com/s?wd=mmPlayer
  //   - https://www.baidu.com/s?wd=es6
  //   - https://www.baidu.com/s?wd=武林外传
  //   - https://www.baidu.com/s?wd=实现简单的实时渲染器
  {
    id: 'baidu-transform',
    name: '百度搜索',
    enabled: true,
    domain: 'baidu.com',
    isRegex: false,
    mode: 'transform',
    transform: {
      selector: '#content_left > [mu]',
      attribute: 'mu',
      fallbackSelector: 'a[href*="baidu.com/link?url="]',
    },
  },

  // ==================== 百度贴吧 ====================
  //   - https://tieba.baidu.com/p/8863884278
  //   - https://tieba.baidu.com/mo/q/checkurl?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  // 注：百度贴吧规则已整合到 baidu.com 域名下

  // ==================== Bing 搜索 ====================
  //   - https://www.bing.com/search?q=mmPlayer
  {
    id: 'bing-transform',
    name: 'Bing 搜索',
    enabled: true,
    domain: 'bing.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="/ck/a?u="]',
      paramKey: 'u',
    },
  },

  // ==================== Google 搜索 ====================
  //   - https://www.google.com/search?q=mmPlayer
  //   - https://www.google.com/search?q=茂茂物语
  //   - https://www.google.com/search?q=1password
  //   - https://www.google.com/url?q=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts&sa=D&source=docs
  //   - https://www.google.com.hk/url?q=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts&sa=D&source=docs
  //   - https://www.google.co.jp/url?q=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts&sa=D&source=docs
  {
    id: 'google-transform',
    name: 'Google 搜索',
    enabled: true,
    domain: 'google.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="/url?q="]',
      paramKey: 'q',
    },
  },
  {
    id: 'google-autojump',
    name: 'Google 重定向页',
    enabled: true,
    domain: 'google.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'q',
      pathPattern: '/url',
    },
  },

  // ==================== 豆瓣 ====================
  //   - https://www.douban.com/link2/?url=https%3A%2F%2Ffe-mm.com
  //   - https://www.douban.com/link2/?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'douban-autojump',
    name: '豆瓣',
    enabled: true,
    domain: 'douban.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
      pathPattern: '/link2/',
    },
  },

  // ==================== 微信 ====================
  //   - https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi?midpagecode=...&bancode=...
  {
    id: 'wechat-autojump',
    name: '微信',
    enabled: true,
    domain: 'weixin110.qq.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      clickSelector: 'a.weui-btn.weui-btn_default',
      pathPattern: '/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi',
    },
  },

  // ==================== 微信开放社区 ====================
  //   - https://developers.weixin.qq.com/community/develop/article/doc/000ecc775a86807f7ba9b7dc956c13
  //   - https://developers.weixin.qq.com/community/middlepage/href?href=https%3A%2F%2Ffe-mm.com
  //   - https://developers.weixin.qq.com/community/middlepage/href?href=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'wechat-community-rewrite',
    name: '微信开放社区',
    enabled: true,
    domain: 'developers.weixin.qq.com',
    isRegex: false,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: '/community/middlepage/href?href=',
      paramKey: 'href',
    },
  },
  {
    id: 'wechat-community-autojump',
    name: '微信开放社区中转页',
    enabled: true,
    domain: 'developers.weixin.qq.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKey: 'href',
      pathPattern: '/community/middlepage/href',
    },
  },

  // ==================== QQ 邮箱 ====================
  //   - https://mail.qq.com/cgi-bin/readtemplate?t=safety&check=false&gourl=https%3A%2F%2Fwww.jetbrains.com
  //   - https://mail.qq.com/cgi-bin/readtemplate?t=safety&check=false&gourl=https%3A%2F%2Ffe-mm.com
  //   - https://mail.qq.com/cgi-bin/readtemplate?t=safety&check=false&gourl=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'qqmail-rewrite',
    name: 'QQ 邮箱',
    enabled: true,
    domain: 'mail.qq.com',
    isRegex: true,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: 'url=',
      paramKey: 'url',
    },
  },
  {
    id: 'qqmail-autojump',
    name: 'QQ 邮箱中转页',
    enabled: true,
    domain: 'mail.qq.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'gourl',
      clickSelector: 'div.c-footer a.c-footer-a1',
      pathPattern: '/cgi-bin/readtemplate',
    },
  },

  // ==================== 腾讯兔小巢 ====================
  //   - https://txc.qq.com/products/606094/
  //   - https://txc.qq.com/products/606094/faqs-more?id=149310
  //   - https://txc.qq.com/products/606094/blog/777398
  //   - https://txc.qq.com/products/606094/link-jump?jump=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://txc.qq.com/embed/phone/606094/link-jump?jump=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://support.qq.com/products/1368
  {
    id: 'txc-transform',
    name: '腾讯兔小巢',
    enabled: true,
    domain: '(txc|support)\\.qq\\.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="/link-jump?jump="]',
      paramKey: 'jump',
    },
  },
  {
    id: 'txc-autojump',
    name: '腾讯兔小巢中转页',
    enabled: true,
    domain: '(txc|support)\\.qq\\.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'jump',
      pathPattern: '/link-jump',
    },
  },

  // ==================== 腾讯文档 ====================
  //   - https://docs.qq.com/doc/DTUtISURFbFN3RFVu
  //   - https://docs.qq.com/scenario/link.html?url=https%3A%2F%2Fnotes.fe-mm.com
  {
    id: 'docsqq-autojump',
    name: '腾讯文档',
    enabled: true,
    domain: 'docs.qq.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
      pathPattern: '/scenario/link.html',
    },
  },

  // ==================== PC 版 QQ ====================
  //   - https://c.pc.qq.com/middlem.html?pfurl=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://c.pc.qq.com/middleb.html?pfurl=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://c.pc.qq.com/pc.html?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://c.pc.qq.com/ios.html?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://c.pc.qq.com/android.html?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://c.pc.qq.com/middlect.html?pfurl=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'pcqq-autojump',
    name: 'PC 版 QQ',
    enabled: true,
    domain: 'c.pc.qq.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKeys: ['pfurl', 'url'],
      pathPattern: '^/[a-z]+\\.html$',
    },
  },

  // ==================== 酷安 ====================
  //   - https://www.coolapk.com/link?url=https://www.lanzou.com
  {
    id: 'coolapk-autojump',
    name: '酷安',
    enabled: true,
    domain: 'coolapk.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
    },
  },

  // ==================== 哔哩哔哩游戏WIKI ====================
  //   - https://game.bilibili.com/linkfilter/?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'bilibili-autojump',
    name: '哔哩哔哩游戏WIKI',
    enabled: true,
    domain: 'game.bilibili.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== 码云 ====================
  //   - https://gitee.com/femm
  //   - https://gitee.com/mirrors/vue-mmplayer
  //   - https://gitee.com/link?target=https%3A%2F%2Ffe-mm.com
  //   - https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'gitee-transform',
    name: '码云',
    enabled: true,
    domain: 'gitee.com',
    isRegex: false,
    mode: 'transform',
    transform: {
      selector: '[href*="gitee.com/link?target="]',
    },
  },
  {
    id: 'gitee-autojump',
    name: '码云中转页',
    enabled: true,
    domain: 'gitee.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
    },
  },

  // ==================== GitCode ====================
  //   - https://gitcode.com/yangzongzhuan/RuoYi-Vue3
  //   - https://link.gitcode.com/?target=https%3A%2F%2Fnotes.fe-mm.com
  {
    id: 'gitcode-rewrite',
    name: 'GitCode',
    enabled: true,
    domain: 'gitcode.com',
    isRegex: true,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: 'link.gitcode.com/?target=',
    },
  },
  {
    id: 'gitcode-autojump',
    name: 'GitCode 中转页',
    enabled: true,
    domain: 'link.gitcode.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== 开源中国 ====================
  //   - https://www.oschina.net/news/226616/fish-shell-be-rewritten-rust
  //   - https://my.oschina.net/dingdayu/blog/867680
  //   - https://www.oschina.net/action/GoToLink?url=https%3A%2F%2Ffe-mm.com
  //   - https://www.oschina.net/action/GoToLink?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'oschina-transform',
    name: '开源中国',
    enabled: true,
    domain: 'oschina.net',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="oschina.net/forward?goto="]',
      paramKey: 'goto',
    },
  },
  {
    id: 'oschina-autojump',
    name: '开源中国中转页',
    enabled: true,
    domain: 'oschina.net',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'goto',
      pathPattern: '/forward',
    },
  },

  // ==================== 51CTO ====================
  //   - https://blog.51cto.com/bashrc/6042107
  {
    id: '51cto-rewrite',
    name: '51CTO 博客',
    enabled: true,
    domain: 'blog.51cto.com',
    isRegex: false,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: '51cto.com/transfer?',
    },
  },

  // ==================== 微博短链接 ====================
  //   - https://t.cn/A61RceZD
  {
    id: 'tcn-autojump',
    name: '微博短链接',
    enabled: true,
    domain: 't.cn',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      clickSelector: 'a.btn',
    },
  },

  // ==================== 语雀 ====================
  //   - https://www.yuque.com/r/goto?url=https%3A%2F%2Ffe-mm.com
  //   - https://www.yuque.com/r/goto?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://bcdh.yuque.com/r/goto?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'yuque-autojump',
    name: '语雀',
    enabled: true,
    domain: 'yuque.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
    },
  },

  // ==================== 力扣 ====================
  //   - https://leetcode.cn/problems/merge-intervals/solutions/204805/chi-jing-ran-yi-yan-miao-dong-by-sweetiee/
  //   - https://leetcode.cn/link/?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'leetcode-transform',
    name: '力扣',
    enabled: true,
    domain: 'leetcode.cn',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="leetcode.cn/link/?target="]',
    },
  },
  {
    id: 'leetcode-autojump',
    name: '力扣中转页',
    enabled: true,
    domain: 'leetcode.cn',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
      pathPattern: '/link/',
    },
  },

  // ==================== NGA ====================
  //   - https://bbs.nga.cn/read.php?tid=38319227
  //   - https://ngabbs.com/read.php?tid=38319227
  //   - https://g.nga.cn/read.php?tid=38319227
  {
    id: 'nga-transform',
    name: 'NGA 玩家社区',
    enabled: true,
    domain: 'nga.cn',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="http"][onclick]',
      attribute: 'href',
    },
  },

  // ==================== 少数派 ====================
  //   - https://sspai.com/post/71216
  //   - https://sspai.com/link?target=https%3A%2F%2Ffe-mm.com
  //   - https://sspai.com/link?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'sspai-transform',
    name: '少数派',
    enabled: true,
    domain: 'sspai.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="sspai.com/link?target="]',
    },
  },
  {
    id: 'sspai-autojump',
    name: '少数派中转页',
    enabled: true,
    domain: 'sspai.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
      pathPattern: '/link',
    },
  },

  // ==================== 360 搜索 ====================
  //   - https://www.so.com/s?q=mmPlayer
  //   - https://www.so.com/s?q=es6
  //   - https://www.so.com/s?q=武林外传
  {
    id: 'so-transform',
    name: '360 搜索',
    enabled: true,
    domain: 'so.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[data-mdurl]',
      attribute: 'data-mdurl',
    },
  },

  // ==================== 搜狗搜索 ====================
  //   - https://sogou.com/web?query=mmPlayer
  //   - https://sogou.com/web?query=武林外传
  //   - https://m.sogou.com/web/searchList.jsp?keyword=mmPlayer
  {
    id: 'sogou-transform',
    name: '搜狗搜索',
    enabled: true,
    domain: 'sogou.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[data-url]',
      attribute: 'data-url',
    },
  },

  // ==================== 爱发电 ====================
  //   - https://afdian.com/a/evanyou
  //   - https://afdian.com/link?target=https%3A%2F%2Ffe-mm.com
  //   - https://afdian.com/link?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'afdian-transform',
    name: '爱发电',
    enabled: true,
    domain: 'afdian.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: '[href*="afdian.net/link?target="]',
    },
  },
  {
    id: 'afdian-autojump',
    name: '爱发电中转页',
    enabled: true,
    domain: 'afdian.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
      pathPattern: '/link',
    },
  },

  // ==================== LINUX DO ====================
  //   - https://linux.do/t/topic/320877
  {
    id: 'linuxdo-transform',
    name: 'LINUX DO',
    enabled: true,
    domain: 'linux.do',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="linux.do/link?url="]',
    },
  },

  // ==================== NodeSeek ====================
  //   - https://www.nodeseek.com/post-128140-1
  //   - https://www.nodeseek.com/jump?to=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'nodeseek-transform',
    name: 'NodeSeek',
    enabled: true,
    domain: 'nodeseek.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="nodeseek.com/forward?url="]',
      paramKey: 'url',
    },
  },
  {
    id: 'nodeseek-autojump',
    name: 'NodeSeek 中转页',
    enabled: true,
    domain: 'nodeseek.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
      pathPattern: '/forward',
    },
  },

  // ==================== 牛客网 ====================
  //   - https://www.nowcoder.com/interview/center
  //   - https://www.nowcoder.com/discuss/451073381044064256
  //   - https://hd.nowcoder.com/link.html?target=https%3A%2F%2Ffe-mm.com
  //   - https://gw-c.nowcoder.com/api/sparta/jump/link?link=https%3A%2F%2Ffe-mm.com
  {
    id: 'nowcoder-transform',
    name: '牛客网',
    enabled: true,
    domain: 'nowcoder.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="nowcoder.com/link?target="]',
    },
  },
  {
    id: 'nowcoder-autojump',
    name: '牛客网中转页',
    enabled: true,
    domain: 'nowcoder.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
      pathPattern: '/link',
    },
  },

  // ==================== 链滴 ====================
  //   - https://ld246.com/article/1704204876718
  {
    id: 'ld246-transform',
    name: '链滴',
    enabled: true,
    domain: 'ld246.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="ld246.com/forward?goto="]',
      paramKey: 'goto',
    },
  },
  {
    id: 'ld246-autojump',
    name: '链滴中转页',
    enabled: true,
    domain: 'ld246.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'goto',
      pathPattern: '/forward',
    },
  },

  // ==================== 腾讯云开发者社区 ====================
  //   - https://cloud.tencent.com/developer/article/1829900
  //   - https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Ffe-mm.com
  //   - https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'tencentcloud-transform',
    name: '腾讯云开发者社区',
    enabled: true,
    domain: 'cloud.tencent.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="cloud.tencent.com/developer/tools/"][href*="target="]',
    },
  },
  {
    id: 'tencentcloud-autojump',
    name: '腾讯云开发者社区中转页',
    enabled: true,
    domain: 'cloud.tencent.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== InfoQ ====================
  //   - https://www.infoq.cn/article/pcy0BDHgmVWzmrTWIHqV
  //   - https://www.infoq.cn/link?target=https%3A%2F%2Fnodejs.dev%2Fen%2Fabout%2Freleases%2F
  //   - https://www.infoq.cn/link?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://xie.infoq.cn/article/aad4610523c72781f0dd5b5b7
  //   - https://xie.infoq.cn/link?target=https%3A%2F%2Fnodejs.dev%2Fen%2Fabout%2Freleases%2F
  //   - https://xie.infoq.cn/link?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'infoq-rewrite',
    name: 'InfoQ',
    enabled: true,
    domain: 'infoq.cn',
    isRegex: true,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: 'infoq.cn/link?target=',
    },
  },
  {
    id: 'infoq-autojump',
    name: 'InfoQ 中转页',
    enabled: true,
    domain: 'infoq.cn',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
    },
  },

  // ==================== 花瓣网 ====================
  //   - https://huaban.com/pins/5108412769
  {
    id: 'huaban-autojump',
    name: '花瓣网',
    enabled: true,
    domain: 'huaban.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      clickSelector: 'a.btn',
    },
  },

  // ==================== 书签地球 ====================
  //   - https://www.bookmarkearth.cn
  //   - https://www.bookmarkearth.cn/view/a61cf21a93d711edb9f55254005bdbf9
  {
    id: 'bookmarkearth-transform',
    name: '书签地球',
    enabled: true,
    domain: 'bookmarkearth.cn',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[data-ext]',
      attribute: 'data-ext',
    },
  },
  {
    id: 'bookmarkearth-autojump',
    name: '书签地球中转页',
    enabled: true,
    domain: 'bookmarkearth.cn',
    isRegex: true,
    mode: 'autojump',
    autojump: {},
  },

  // ==================== 金山文档 ====================
  //   - https://www.kdocs.cn/office/link?target=https%3A%2F%2Ffe-mm.com
  //   - https://www.kdocs.cn/office/link?target=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'kdocs-autojump',
    name: '金山文档',
    enabled: true,
    domain: 'kdocs.cn',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'target',
    },
  },

  // ==================== 石墨文档 ====================
  //   - https://shimo.im/docs/B1AwdzJNe1FGwe3m
  //   - https://shimo.im/outlink/gray?url=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'shimo-rewrite',
    name: '石墨文档',
    enabled: true,
    domain: 'shimo.im',
    isRegex: true,
    mode: 'rewrite-open',
    rewriteOpen: {
      matchString: 'shimo.im/outlink/gray?url=',
      paramKey: 'url',
    },
  },
  {
    id: 'shimo-autojump',
    name: '石墨文档中转页',
    enabled: true,
    domain: 'shimo.im',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
    },
  },

  // ==================== Steam 社区 ====================
  //   - https://steamcommunity.com/linkfilter/?u=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'steam-autojump',
    name: 'Steam 社区',
    enabled: true,
    domain: 'steamcommunity.com',
    isRegex: false,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
    },
  },

  // ==================== ACG盒子 ====================
  //   - https://www.acgbox.link
  //   - https://www.acgbox.link/h/58.html
  //   - https://www.acgbox.link/go/?url=aHR0cHM6Ly93d3cucGl4aXYubmV0Lw%3D%3D
  {
    id: 'acgbox-transform',
    name: 'ACG盒子',
    enabled: true,
    domain: 'acgbox.link',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="acgbox.link/?url="]',
      paramKey: 'url',
    },
  },
  {
    id: 'acgbox-autojump',
    name: 'ACG盒子中转页',
    enabled: true,
    domain: 'acgbox.link',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
    },
  },

  // ==================== pixiv ====================
  //   - https://www.pixiv.net/artworks/105069080
  //   - https://www.pixiv.net/users/49552835
  {
    id: 'pixiv-transform',
    name: 'pixiv',
    enabled: true,
    domain: 'pixiv.net',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="pixiv.net/jump.php?url="]',
      paramKey: 'url',
    },
  },
  {
    id: 'pixiv-autojump',
    name: 'pixiv 中转页',
    enabled: true,
    domain: 'pixiv.net',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'url',
    },
  },

  // ==================== Facebook ====================
  //   - https://l.facebook.com/l.php?u=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  //   - https://www.facebook.com/flx/warn/?u=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'facebook-transform',
    name: 'Facebook',
    enabled: true,
    domain: 'facebook.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="facebook.com/l.php?u="]',
      paramKey: 'u',
    },
  },
  {
    id: 'facebook-autojump',
    name: 'Facebook 中转页',
    enabled: true,
    domain: 'facebook.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'u',
      pathPattern: '/l.php',
    },
  },

  // ==================== Twitter / X ====================
  //   - https://twitter.com
  //   - https://twitter.com/vuejs
  //   - https://x.com
  //   - https://x.com/vuejs
  {
    id: 'twitter-transform',
    name: 'Twitter/X',
    enabled: true,
    domain: '(twitter\\.com|x\\.com)',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="//t.co/"][rel="nofollow"]',
    },
  },

  // ==================== YouTube ====================
  //   - https://www.youtube.com/watch?v=c5vGiaTudPc
  //   - https://www.youtube.com/redirect?&q=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts
  {
    id: 'youtube-transform',
    name: 'YouTube',
    enabled: true,
    domain: 'youtube.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="youtube.com/redirect?q="]',
      paramKey: 'q',
    },
  },
  {
    id: 'youtube-autojump',
    name: 'YouTube 中转页',
    enabled: true,
    domain: 'youtube.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'q',
      pathPattern: '/redirect',
    },
  },

  // ==================== Instagram ====================
  //   - https://www.instagram.com/jaychou
  //   - https://www.instagram.com/linkshim/?u=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts&e=...
  //   - https://l.instagram.com/?u=https%3A%2F%2Fgithub.com%2Fmaomao1996%2Ftampermonkey-scripts&e=...
  {
    id: 'instagram-transform',
    name: 'Instagram',
    enabled: true,
    domain: 'instagram.com',
    isRegex: true,
    mode: 'transform',
    transform: {
      selector: 'a[href*="instagram.com/l.php?u="]',
      paramKey: 'u',
    },
  },
  {
    id: 'instagram-autojump',
    name: 'Instagram 中转页',
    enabled: true,
    domain: 'instagram.com',
    isRegex: true,
    mode: 'autojump',
    autojump: {
      paramKey: 'u',
      pathPattern: '/l.php',
    },
  },
]

// ==================== 规则组定义 ====================

export interface RawGroupDef {
  id: string
  name: string
  ruleIds: string[]
}

/** 所有内置规则的分组定义 */
export const builtinGroupDefs: RawGroupDef[] = [
  { id: 'zhihu', name: '知乎', ruleIds: ['zhihu-transform', 'zhihu-autojump'] },
  { id: 'csdn', name: 'CSDN', ruleIds: ['csdn-rewrite-open', 'csdn-autojump'] },
  { id: 'juejin', name: '掘金', ruleIds: ['juejin-transform', 'juejin-autojump'] },
  { id: 'jianshu', name: '简书', ruleIds: ['jianshu-transform', 'jianshu-autojump'] },
  { id: 'weibo', name: '微博', ruleIds: ['weibo-transform', 'weibo-autojump'] },
  { id: 'baidu', name: '百度搜索', ruleIds: ['baidu-transform'] },
  { id: 'bing', name: 'Bing 搜索', ruleIds: ['bing-transform'] },
  { id: 'google', name: 'Google 搜索', ruleIds: ['google-transform', 'google-autojump'] },
  { id: 'douban', name: '豆瓣', ruleIds: ['douban-autojump'] },
  { id: 'wechat', name: '微信', ruleIds: ['wechat-autojump'] },
  { id: 'wechat-community', name: '微信开放社区', ruleIds: ['wechat-community-rewrite', 'wechat-community-autojump'] },
  { id: 'qqmail', name: 'QQ 邮箱', ruleIds: ['qqmail-rewrite', 'qqmail-autojump'] },
  { id: 'txc', name: '腾讯兔小巢', ruleIds: ['txc-transform', 'txc-autojump'] },
  { id: 'docsqq', name: '腾讯文档', ruleIds: ['docsqq-autojump'] },
  { id: 'pcqq', name: 'PC 版 QQ', ruleIds: ['pcqq-autojump'] },
  { id: 'coolapk', name: '酷安', ruleIds: ['coolapk-autojump'] },
  { id: 'bilibili', name: '哔哩哔哩游戏', ruleIds: ['bilibili-autojump'] },
  { id: 'gitee', name: '码云', ruleIds: ['gitee-transform', 'gitee-autojump'] },
  { id: 'gitcode', name: 'GitCode', ruleIds: ['gitcode-rewrite', 'gitcode-autojump'] },
  { id: 'oschina', name: '开源中国', ruleIds: ['oschina-transform', 'oschina-autojump'] },
  { id: '51cto', name: '51CTO', ruleIds: ['51cto-rewrite'] },
  { id: 'tcn', name: '微博短链接', ruleIds: ['tcn-autojump'] },
  { id: 'yuque', name: '语雀', ruleIds: ['yuque-autojump'] },
  { id: 'leetcode', name: '力扣', ruleIds: ['leetcode-transform', 'leetcode-autojump'] },
  { id: 'nga', name: 'NGA', ruleIds: ['nga-transform'] },
  { id: 'sspai', name: '少数派', ruleIds: ['sspai-transform', 'sspai-autojump'] },
  { id: 'so', name: '360 搜索', ruleIds: ['so-transform'] },
  { id: 'sogou', name: '搜狗搜索', ruleIds: ['sogou-transform'] },
  { id: 'afdian', name: '爱发电', ruleIds: ['afdian-transform', 'afdian-autojump'] },
  { id: 'linuxdo', name: 'LINUX DO', ruleIds: ['linuxdo-transform'] },
  { id: 'nodeseek', name: 'NodeSeek', ruleIds: ['nodeseek-transform', 'nodeseek-autojump'] },
  { id: 'nowcoder', name: '牛客网', ruleIds: ['nowcoder-transform', 'nowcoder-autojump'] },
  { id: 'ld246', name: '链滴', ruleIds: ['ld246-transform', 'ld246-autojump'] },
  { id: 'tencentcloud', name: '腾讯云社区', ruleIds: ['tencentcloud-transform', 'tencentcloud-autojump'] },
  { id: 'infoq', name: 'InfoQ', ruleIds: ['infoq-rewrite', 'infoq-autojump'] },
  { id: 'huaban', name: '花瓣网', ruleIds: ['huaban-autojump'] },
  { id: 'bookmarkearth', name: '书签地球', ruleIds: ['bookmarkearth-transform', 'bookmarkearth-autojump'] },
  { id: 'kdocs', name: '金山文档', ruleIds: ['kdocs-autojump'] },
  { id: 'shimo', name: '石墨文档', ruleIds: ['shimo-rewrite', 'shimo-autojump'] },
  { id: 'steam', name: 'Steam 社区', ruleIds: ['steam-autojump'] },
  { id: 'acgbox', name: 'ACG 盒子', ruleIds: ['acgbox-transform', 'acgbox-autojump'] },
  { id: 'pixiv', name: 'Pixiv', ruleIds: ['pixiv-transform', 'pixiv-autojump'] },
  { id: 'facebook', name: 'Facebook', ruleIds: ['facebook-transform', 'facebook-autojump'] },
  { id: 'twitter', name: 'Twitter / X', ruleIds: ['twitter-transform'] },
  { id: 'youtube', name: 'YouTube', ruleIds: ['youtube-transform', 'youtube-autojump'] },
  { id: 'instagram', name: 'Instagram', ruleIds: ['instagram-transform', 'instagram-autojump'] },
]

/** 根据分组定义和规则数组构建 RuleGroup[] */
export function buildRuleGroups(rules: Rule[], groupDefs: RawGroupDef[]): RuleGroup[] {
  const ruleMap = new Map(rules.map(r => [r.id, r]))
  return groupDefs.map(def => ({
    id: def.id,
    name: def.name,
    enabled: true,
    rules: def.ruleIds
      .map(id => ruleMap.get(id))
      .filter((r): r is Rule => r !== undefined),
  }))
}

/** 按组结构组织的内置规则 */
export const builtinRuleGroups: RuleGroup[] = buildRuleGroups(builtinRules, builtinGroupDefs)

/** 获取扁平的内置规则列表（用于 content script / popup 中的匹配） */
export function getFlatBuiltinRules(): Rule[] {
  return builtinRules
}
