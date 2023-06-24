import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type HoverTracking = {
  status: ComputedRef<'entered' | 'exited'>
  is: {
    entered: () => boolean,
    exited: () => boolean,
  }
}

export function useHoverTracking (extendable: ExtendableElement): HoverTracking {
  const element = narrowElement(extendable)

  const status = ref<'entered' | 'exited'>('exited')

  on(
    element,
    {
      mouseenter: () => status.value = 'entered',
      mouseleave: () => status.value = 'exited',
    }
  )

  return {
    status: computed(() => status.value),
    is: {
      entered: () => status.value === 'entered',
      exited: () => status.value === 'exited',
    },
  }
}
