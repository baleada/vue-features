import { onMounted, watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import type { StoreableOptions } from '@baleada/logic'

// Shared options for all storage extensions
export type Storage = { storeable: ReturnType<typeof useStoreable> }
export type StorageOptions = { key?: string } & StoreableOptions

export function useStorage (
  { key, initialEffect, getString }: {
    key: string,
    initialEffect?: (storeable: ReturnType<typeof useStoreable>) => void,
    getString?: (storeable: ReturnType<typeof useStoreable>) => string,
  }
): Storage {
  const storeable = useStoreable(key),
        storeEffect = () => storeable.value.store(getString(storeable))

  onMounted(() => {
    initialEffect(storeable)
    watchEffect(storeEffect)
  })

  return { storeable }
}
