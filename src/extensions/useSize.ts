import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import type { OnEffectObject } from '../affordances'
import { toEntries, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Size = {
  rect: Ref<DOMRectReadOnly>,
  breaks: Ref<{ [breakpoint: string] : boolean }>,
  orientation: Ref<'none' | 'portrait' | 'landscape'>,
}

export type UseSizeOptions = {
  breakpoints?: { [breakpoint: string]: number },
} & OnEffectObject<'resize'>['options']['listen']

const defaultOptions: UseSizeOptions = {
  // Defaults to Tailwind breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
}

export function useSize (
  extendable: Extendable,
  options: UseSizeOptions = {}
): Size {
  // OPTIONS
  const { breakpoints } = { ...defaultOptions, ...options }


  // PIXELS
  const rect = ref<DOMRectReadOnly>()
  on<'resize'>({
    element: ensureElementFromExtendable(extendable),
    effects: defineEffect => [
     defineEffect(
        'resize',
        {
          createEffect: () => entries => rect.value = entries[0].contentRect,
          options: {
            listen: {
              observe: options.observe || {},
            }
          }
        }
     ), 
    ]
  })


  // BREAKS
  const sorted = toEntries(breakpoints).sort(([, pixelsA], [, pixelsZ]) => pixelsZ - pixelsA),
        withZero: [string, number][] = sorted[0][1] > 0 ? [['zero', 0], ...sorted] : sorted,
        assertions = withZero.map(([, p]) => pixels => pixels >= p),
        breaks: Size['breaks'] = computed(() => assertions.reduce((breaks, assertion, index) => {
          const breakpoint = withZero[index][0]
          breaks[breakpoint] = rect.value ? assertion(rect.value.width) : false
          return breaks
        }, {}))

  
  // ORIENTATION
  const orientation = computed(() => {
    if (!rect.value || rect.value.width === rect.value.height) {
      return 'none'
    }

    return rect.value.width < rect.value.height
      ? 'portrait'
      : 'landscape'
  })


  // API
  return {
    rect,
    breaks,
    orientation,
  }
}
