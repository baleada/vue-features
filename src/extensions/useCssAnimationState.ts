import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type CssAnimationState = {
  status: ComputedRef<'ready' | 'animating' | 'animated'>,
  elapsedTime: ComputedRef<number>,
  iterations: ComputedRef<number>,
}

export function useCssAnimationState (extendable: ExtendableElement) {
  const element = narrowElement(extendable),
        status = ref<CssAnimationState['status']['value']>('ready'),
        elapsedTime = ref<CssAnimationState['elapsedTime']['value']>(),
        iterations = ref<CssAnimationState['iterations']['value']>(0)

  on(
    element,
    {
      animationstart: event => {
        iterations.value = 0
        status.value = 'animating'
        elapsedTime.value = event.elapsedTime
      },
      animationiteration: event => {
        iterations.value += 1
        elapsedTime.value = event.elapsedTime
      },
      animationend: event => {      
        status.value = 'animated'
        elapsedTime.value = event.elapsedTime
      },
      animationcancel: event => {
        status.value = 'ready'
        elapsedTime.value = event.elapsedTime
      },
    },
  )

  return {
    status: computed(() => status.value),
    elapsedTime: computed(() => elapsedTime.value),
    iterations: computed(() => iterations.value),
  }
}
