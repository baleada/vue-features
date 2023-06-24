import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Visibility = {
  rect: Ref<{
    visible: IntersectionObserverEntry['intersectionRect'],
    bounding: IntersectionObserverEntry['boundingClientRect'],
    viewport: IntersectionObserverEntry['rootBounds'],
  }>,
  ratio: Ref<IntersectionObserverEntry['intersectionRatio']>,
  status: Ref<'visible' | 'invisible'>,
  isVisible: Ref<boolean>,
  time: Ref<IntersectionObserverEntry['time']>,
}

export type UseVisibilityOptions = OnEffectConfig<HTMLElement, 'intersect'>['options']['listen']

export function useVisibility (
  extendable: ExtendableElement,
  options: UseVisibilityOptions = {}
): Visibility {
  const rect: Visibility['rect'] = ref(),
        ratio: Visibility['ratio'] = ref(),
        status: Visibility['status'] = ref(),
        isVisible: Visibility['isVisible'] = computed(() => status.value === 'visible'),
        time: Visibility['time'] = ref(),
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
    rect,
    ratio,
    status,
    isVisible,
    time,
  }
}
