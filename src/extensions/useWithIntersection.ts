import { ref } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type WithIntersection = {
  rect: Ref<{
    visible: IntersectionObserverEntry['intersectionRect'],
    bounding: IntersectionObserverEntry['boundingClientRect'],
    viewport: IntersectionObserverEntry['rootBounds'],
  }>,
  ratio: Ref<IntersectionObserverEntry['intersectionRatio']>,
  status: Ref<'visible' | 'invisible'>,
  is: {
    visible: () => boolean,
    invisible: () => boolean,
  },
  time: Ref<IntersectionObserverEntry['time']>,
}

export type UseWithIntersectionOptions = OnEffectConfig<HTMLElement, 'intersect'>['options']['listen']

export function useWithIntersection (
  extendable: ExtendableElement,
  options: UseWithIntersectionOptions = {}
): WithIntersection {
  const rect: WithIntersection['rect'] = ref(),
        ratio: WithIntersection['ratio'] = ref(),
        status: WithIntersection['status'] = ref(),
        time: WithIntersection['time'] = ref(),
        element = narrowElement(extendable)

  on(
    element,
    {
      intersect: {
        createEffect: () => entries => {
          const entry = entries[0]
          
          ratio.value = entry.intersectionRatio
          rect.value = {
            visible: entry.intersectionRect,
            bounding: entry.boundingClientRect,
            viewport: entry.rootBounds,
          }
          status.value = entry.isIntersecting ? 'visible' : 'invisible'
          time.value = entry.time
        },
        options: {
          listen: {
            observer: options.observer || {},
          },
        },
      },
    }
  )
  

  // API
  return {
    status,
    is: {
      visible: () => status.value === 'visible',
      invisible: () => status.value === 'invisible',
    },
    rect,
    ratio,
    time,
  }
}
