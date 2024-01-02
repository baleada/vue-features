import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { on } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type WithCssAnimation = {
  status: ComputedRef<'ready' | 'animating' | 'animated'>,
  elapsedTime: ComputedRef<number>,
  iterations: ComputedRef<number>,
}

export function useWithCssAnimation (extendable: ExtendableElement) {
  const element = narrowElement(extendable),
        status = ref<WithCssAnimation['status']['value']>('ready'),
        elapsedTime = ref<WithCssAnimation['elapsedTime']['value']>(),
        iterations = ref<WithCssAnimation['iterations']['value']>(0)

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
