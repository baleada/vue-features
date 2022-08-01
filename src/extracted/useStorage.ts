import { onMounted, watch, watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import type { StoreableOptions } from '@baleada/logic'
import { BindElement } from '../affordances'

// Shared options for all storage extensions (not for useStorage itself)
export type Storage = { storeable: ReturnType<typeof useStoreable> }
export type UseStorageOptions = {
  key?: string
} & StoreableOptions

export function useStorage<B extends BindElement> (
  elementOrListOrPlane: B,
  key: string,
  initialEffect: (storeable: ReturnType<typeof useStoreable>) => void,
  getString: (storeable: ReturnType<typeof useStoreable>) => string
): Storage {
  const storeable = useStoreable(key),
        storeEffect = () => storeable.value.store(getString(storeable))

  onMounted(() => {
    let initialEffectStatus: 'ready' | 'performed' = 'ready'
    
    const stop = watch(
      elementOrListOrPlane,
      () => {
        initialEffect(storeable)
        initialEffectStatus = 'performed'
        stop()
      }
    )

    watchEffect(() => {
      if (initialEffectStatus === 'performed') storeEffect()
    })
  })

  return { storeable }
}
