import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type WithFocus = {
  status: ComputedRef<'focused' | 'blurred'>
  is: {
    focused: () => boolean,
    blurred: () => boolean,
  }
}

export function useWithFocus (extendable: ExtendableElement): WithFocus {
  const element = narrowElement(extendable)

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
