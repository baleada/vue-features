import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ListenOptions } from '@baleada/logic'
import { on } from '../affordances'
import { ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Intersection = {
  ratio: Ref<IntersectionObserverEntry['intersectionRatio']>,
  rect: Ref<{
    visible: IntersectionObserverEntry['intersectionRect'],
    bounding: IntersectionObserverEntry['boundingClientRect'],
    viewport: IntersectionObserverEntry['rootBounds'],
  }>,
  is: Ref<IntersectionObserverEntry['isIntersecting']>,
  time: Ref<IntersectionObserverEntry['time']>,
}

export type UseIntersectionOptions = Omit<ListenOptions<'intersect'>, 'target'>

export function useIntersection (
  extendable: Extendable,
  options: UseIntersectionOptions = {}
): Intersection {
  const ratio: Intersection['ratio'] = ref(),
        rect: Intersection['rect'] = ref(),
        is: Intersection['is'] = ref(),
        time: Intersection['time'] = ref(),
        element = ensureElementFromExtendable(extendable)

  on<'intersect'>({
    element,
    effects: defineEffect => [
     defineEffect(
        'intersect',
        {
          createEffect: () => entries => {
            const entry = entries[0]

            ratio.value = entry.intersectionRatio
            rect.value = {
              visible: entry.intersectionRect,
              bounding: entry.boundingClientRect,
              viewport: entry.rootBounds,
            }
            is.value = entry.isIntersecting
            time.value = entry.time
          },
          options: {
            listen: {
              observer: options.observer || {},
            }
          }
        }
        
     ), 
    ]
  })
  

  // API
  return {
    ratio,
    rect,
    is,
    time,
  }
}
