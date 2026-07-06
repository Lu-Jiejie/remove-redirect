import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import { presetAttributify, presetIcons, presetUno, presetWebFonts, transformerDirectives } from 'unocss'
import { defineConfig } from 'unocss/vite'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetWebFonts({
      fonts: {
        sans: ['Inter:400,600,800', 'Noto Sans SC:400,600,800'],
        mono: ['Fira Code:400,600,800', 'Noto Sans SC:400,600,800'],
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  shortcuts: {
    'rr-button': 'inline-flex items-center justify-center min-h-38px gap-2 px-14px border border-[var(--rr-line-strong)] rounded-8px bg-[var(--rr-control)] color-[var(--rr-ink)] cursor-pointer text-13px font-650 leading-none tracking-0 transition-[background-color,border-color,box-shadow,transform] duration-140 ease-out hover:bg-[var(--rr-control-hover)] hover:shadow-[0_8px_24px_var(--rr-shadow)] disabled:cursor-default disabled:opacity-48 focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-2',
    'rr-button-primary': 'border-[var(--rr-green-line)] bg-[var(--rr-green)] color-[oklch(98%_0.012_150)] hover:bg-[oklch(52%_0.13_158)]',
    'rr-button-danger': 'border-[var(--rr-danger-line)] bg-[var(--rr-danger-soft)] color-[var(--rr-danger-text)]',
    'rr-icon-button': 'inline-grid h-36px w-36px flex-none place-items-center border border-[var(--rr-line)] rounded-8px bg-[var(--rr-control)] color-[var(--rr-muted)] cursor-pointer hover:bg-[var(--rr-control-hover)] hover:color-[var(--rr-ink)] focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-2',
    'rr-input': 'h-40px w-full min-w-0 border border-[var(--rr-line)] rounded-8px bg-[var(--rr-control)] px-12px color-[var(--rr-ink)] text-14px tracking-0 outline-none transition-[background-color,border-color,box-shadow] duration-140 ease-out placeholder:color-[var(--rr-subtle)] focus:border-[var(--rr-blue-line)] focus:bg-[var(--rr-control-hover)] focus:shadow-[0_0_0_3px_var(--rr-blue-halo)]',
    'rr-input-mono': 'font-mono text-13px',
    'rr-surface': 'border border-[var(--rr-line)] rounded-8px bg-[var(--rr-panel)]',
    'rr-panel': 'border border-[var(--rr-line)] rounded-8px bg-[var(--rr-panel)]',
    'rr-panel-muted': 'border border-[var(--rr-line)] rounded-8px bg-[var(--rr-panel-muted)]',
    'rr-label': 'color-[var(--rr-muted)] text-12px font-600 leading-[1.35]',
    'rr-text-strong': 'color-[var(--rr-ink)] tracking-0',
    'rr-text-muted': 'color-[var(--rr-muted)]',
    'rr-mono': 'font-mono',
    'rr-badge': 'inline-flex max-w-full items-center min-h-24px rounded-6px border px-8px pb-4px pt-3px text-12px font-650 leading-[1.35] tracking-0 whitespace-nowrap',
    'rr-badge-transform': 'border-[var(--rr-blue-line)] bg-[var(--rr-blue-soft)] color-[var(--rr-blue-text)]',
    'rr-badge-autojump': 'border-[var(--rr-green-line)] bg-[var(--rr-green-soft)] color-[var(--rr-green-text)]',
    'rr-badge-rewrite-open': 'border-[var(--rr-orange-line)] bg-[var(--rr-orange-soft)] color-[var(--rr-orange-text)]',
    'rr-brand-mark': 'grid h-40px w-40px flex-none place-items-center border border-[var(--rr-line)] rounded-8px bg-[var(--rr-mark)] shadow-[inset_0_-1px_0_var(--rr-inset)]',
    'rr-theme-toggle': 'inline-grid h-34px w-34px flex-none place-items-center border border-[var(--rr-line)] rounded-8px bg-[var(--rr-control)] color-[var(--rr-muted)] cursor-pointer transition-[background-color,border-color,color,box-shadow] duration-160 ease-out hover:border-[var(--rr-line-strong)] hover:bg-[var(--rr-control-hover)] hover:color-[var(--rr-ink)] focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-2',
  },
  transformers: [
    transformerDirectives(),
  ],
})
