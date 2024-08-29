import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Hover = {
  status: ComputedRef<'hovered' | 'exited'>
  is: {
    hovered: () => boolean,
    exited: () => boolean,
  }
}

export function useHover (extendable: ExtendableElement): Hover {
  const element = narrowElement(extendable),
        status = ref<'hovered' | 'exited'>('exited')

  on(
    element,
    {
      mouseenter: () => status.value = 'hovered',
      mouseleave: () => status.value = 'exited',
      touchstart: event => event.preventDefault(),
    }
  )

  return {
    status: computed(() => status.value),
    is: {
      hovered: () => status.value === 'hovered',
      exited: () => status.value === 'exited',
    },
  }
}
