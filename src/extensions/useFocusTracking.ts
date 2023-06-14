import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type FocusTracking = {
  status: ComputedRef<'focused' | 'blurred'>
  is: {
    focused: () => boolean,
    blurred: () => boolean,
  }
}

export function useFocusTracking (extendable: Extendable): FocusTracking {
  const element = narrowElementFromExtendable(extendable)

  const status = ref<'focused' | 'blurred'>('blurred')

  on(
    element,
    {
      focus: () => status.value = 'focused',
      blur: () => status.value = 'blurred',
    }
  )

  return {
    status: computed(() => status.value),
    is: {
      focused: () => status.value === 'focused',
      blurred: () => status.value === 'blurred',
    },
  }
}
