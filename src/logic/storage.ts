import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const { data: storageDemo, dataReady: storageDemoReady } = useWebExtensionStorage('webext-demo', 'Storage Demo')

// Remove Redirect 相关存储键名
export const STORAGE_KEYS = {
  USER_RULES: 'remove-redirect:user-rules',
  SETTINGS: 'remove-redirect:settings',
} as const
