import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type HoverTracking = {
  status: ComputedRef<'entered' | 'exited'>
  is: {
    entered: () => boolean,
    exited: () => boolean,
  }
}

export function useHoverTracking (extendable: Extendable): HoverTracking {
  const element = ensureElementFromExtendable(extendable)

  const status = ref<'entered' | 'exited'>('exited')

  on<'mouseenter' | 'mouseleave'>({
    element,
    effects: defineEffect => [
      defineEffect(
        'mouseenter',
        () => status.value = 'entered',
      ),
      defineEffect(
        'mouseleave',
        () => status.value = 'exited',
      ),
    ]
  })

  return {
    status: computed(() => status.value),
    is: {
      entered: () => status.value === 'entered',
      exited: () => status.value === 'exited',
    },
  }
}
