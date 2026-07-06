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
  transformers: [
    transformerDirectives(),
  ],
})
