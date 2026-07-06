<script setup lang="ts">
import { useThemeMode } from '~/composables/useThemeMode'

const { isDark, themeLabel, toggleTheme } = useThemeMode()
</script>

<template>
  <button
    type="button"
    class="inline-grid h-34px w-34px flex-none place-items-center border border-[var(--rr-line)] rounded-8px bg-[var(--rr-control)] color-[var(--rr-muted)] cursor-pointer transition-[background-color,border-color,color,box-shadow] duration-160 ease-out hover:border-[var(--rr-line-strong)] hover:bg-[var(--rr-control-hover)] hover:color-[var(--rr-ink)] focus-visible:outline-2 focus-visible:outline-[var(--rr-focus)] focus-visible:outline-offset-2"
    :aria-label="themeLabel"
    :title="themeLabel"
    @click="toggleTheme"
  >
    <span v-if="isDark" class="i-carbon:sun h-17px w-17px" />
    <span v-else class="i-carbon:moon h-17px w-17px" />
  </button>
</template>
