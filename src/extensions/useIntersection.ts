import { shallowRef } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Intersection = {
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

export type UseIntersectionOptions = OnEffectConfig<HTMLElement, 'intersect'>['options']['listen']

export function useIntersection (
  extendable: ExtendableElement,
  options: UseIntersectionOptions = {}
): Intersection {
  const rect: Intersection['rect'] = shallowRef(),
        ratio: Intersection['ratio'] = shallowRef(),
        status: Intersection['status'] = shallowRef(),
        time: Intersection['time'] = shallowRef(),
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
