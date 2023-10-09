import { onMounted, watch, watchEffect, nextTick } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import type { StoreableOptions } from '@baleada/logic'
import type { BindElement } from '../affordances'

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
        storeEffect = () => storeable.store(getString(storeable))

  onMounted(() => {
    let initialEffectStatus: 'ready' | 'performed' = 'ready'
    
    const renderEffect = () => {
            initialEffect(storeable)
            initialEffectStatus = 'performed'
            nextTick(stop)
          },
          stop = watch(elementOrListOrPlane, renderEffect, { flush: 'post' })

    renderEffect()

    watchEffect(() => {
      if (initialEffectStatus === 'performed') storeEffect()
    })
  })

  return { storeable }
}
