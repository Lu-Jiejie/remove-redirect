import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import { presetAttributify, presetIcons, presetUno, presetWebFonts, transformerDirectives } from 'unocss'
import { defineConfig } from 'unocss/vite'

export default defineConfig({
  shortcuts: {
    // 层次：3 级立面模型
    // rr-card - 悬浮容器（纸面 + 投影），页面顶层
    // rr-tile - 侧栏浅色芯片，浮于侧栏底色之上
    // rr-well - 卡片内的凹陷面板，用于嵌套内容，制造纵深
    'rr-card': 'border border-[var(--rr-line)] rounded-14px bg-[var(--rr-paper)] shadow-[0_4px_24px_var(--rr-shadow)]',
    'rr-tile': 'border border-[var(--rr-line)] rounded-10px bg-[var(--rr-panel)]',
    'rr-well': 'border border-[var(--rr-line)] rounded-10px bg-[var(--rr-panel-muted)]',
    // 统一：文字层级
    'rr-label': 'color-[var(--rr-muted)] text-12px font-600 leading-[1.35]',
    'rr-section-title': 'color-[var(--rr-ink)] text-14px font-700 leading-[1.35]',
    // 统一：带边框图标按钮
    'rr-icon-btn': 'inline-grid place-items-center border border-[var(--rr-line)] rounded-8px bg-[var(--rr-control)] color-[var(--rr-muted)] cursor-pointer transition-[background-color,border-color,color,box-shadow] duration-140 ease-out hover:bg-[var(--rr-control-hover)] hover:color-[var(--rr-ink)] hover:border-[var(--rr-line-strong)] hover:shadow-[0_2px_8px_var(--rr-shadow)] focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-2',
    // 统一：无边框幽灵图标按钮（行内操作，如编辑/删除）
    'rr-icon-ghost': 'inline-grid place-items-center border-0 rounded-7px bg-transparent color-[var(--rr-subtle)] cursor-pointer transition-[background-color,color] duration-120 ease-out focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-1',
    // 统一：行内代码芯片
    'rr-code': 'inline-block font-mono color-[var(--rr-ink)] bg-[var(--rr-inset)] rounded-5px px-5px py-1px leading-[1.5]',
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: ['Outfit:400,600,800', 'Noto Sans SC:400,600,800'],
        mono: ['JetBrains Mono:400,600,800', 'Noto Sans SC:400,600,800'],
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
})
