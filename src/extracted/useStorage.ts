import { onMounted, watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'

// Shared options for all storage extensions
export type StorageOptions = { key?: string }

export function useStorage (
  { key, initialEffect, getString }: {
    key: string,
    initialEffect?: (storeable: ReturnType<typeof useStoreable>) => void,
    getString?: () => string,
  }
): ReturnType<typeof useStoreable> {
  const storeable = useStoreable(key),
        storeEffect = () => storeable.value.store(getString())

  onMounted(() => {
    initialEffect(storeable)
    watchEffect(storeEffect)
  })

  return storeable
}
