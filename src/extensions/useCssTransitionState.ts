import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type CssTransitionState = {
  status: ComputedRef<'ready' | 'transitioning' | 'transitioned'>,
  elapsedTime: ComputedRef<number>,
}

export function useCssTransitionState (extendable: ExtendableElement) {
  const element = narrowElement(extendable),
        status = ref<CssTransitionState['status']['value']>('ready'),
        elapsedTime = ref<CssTransitionState['elapsedTime']['value']>()

  on(
    element,
    {
      transitionstart: event => {
        status.value = 'transitioning'
        elapsedTime.value = event.elapsedTime
      },
      transitionend: event => {      
        status.value = 'transitioned'
        elapsedTime.value = event.elapsedTime
      },
      transitioncancel: event => {
        status.value = 'ready'
        elapsedTime.value = event.elapsedTime
      },
    },
  )

  return {
    status: computed(() => status.value),
    elapsedTime: computed(() => elapsedTime.value),
  }
}
