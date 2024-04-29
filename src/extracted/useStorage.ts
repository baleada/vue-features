import { watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import type { StoreableOptions } from '@baleada/logic'
import type { BindElement } from '../affordances'
import { narrowReactivePlane } from './narrowReactivePlane'
import { onPlaneRendered } from './onPlaneRendered'

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
  const elements = narrowReactivePlane(elementOrListOrPlane),
        storeable = useStoreable(key),
        storeEffect = () => storeable.store(getString(storeable))

  const stopInitialEffect = onPlaneRendered(
    elements,
    {
      planeEffect: () => {
        if (!elements.value[0].length) return

        initialEffect(storeable)
        stopInitialEffect()

        watchEffect(storeEffect)
      },
    }
  )

  return { storeable }
}
