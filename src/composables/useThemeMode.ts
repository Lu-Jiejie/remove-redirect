import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

export function useThemeMode() {
  const mode = useColorMode({
    storageKey: 'remove-redirect:theme',
    initialValue: 'auto',
  })

  const isDark = computed(() => mode.value === 'dark')
  const themeLabel = computed(() => isDark.value ? '切换到浅色主题' : '切换到深色主题')

  function toggleTheme() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  return {
    mode,
    isDark,
    themeLabel,
    toggleTheme,
  }
}
