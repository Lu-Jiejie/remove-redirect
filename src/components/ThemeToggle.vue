<script setup lang="ts">
import { useThemeMode } from '~/composables/useThemeMode'

const { isDark, themeLabel, toggleTheme } = useThemeMode()
</script>

<template>
  <button
    type="button"
    class="rr-icon-btn h-34px w-34px flex-none"
    :aria-label="themeLabel"
    :title="themeLabel"
    @click="toggleTheme"
  >
    <span v-if="isDark" class="i-carbon:sun h-17px w-17px" />
    <span v-else class="i-carbon:moon h-17px w-17px" />
  </button>
</template>
