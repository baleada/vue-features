import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Hovering = {
  status: ComputedRef<'hovered' | 'exited'>
  is: {
    hovered: () => boolean,
    exited: () => boolean,
  }
}

export function useHovering (extendable: ExtendableElement): Hovering {
  const element = narrowElement(extendable)

  const status = ref<'hovered' | 'exited'>('exited')

  on(
    element,
    {
      mouseenter: () => status.value = 'hovered',
      mouseleave: () => status.value = 'exited',
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
