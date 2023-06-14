import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type HoverTracking = {
  status: ComputedRef<'entered' | 'exited'>
  is: {
    entered: () => boolean,
    exited: () => boolean,
  }
}

export function useHoverTracking (extendable: Extendable): HoverTracking {
  const element = narrowElementFromExtendable(extendable)

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
