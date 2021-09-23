import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import { toEntries, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Size = {
  pixels: Ref<DOMRectReadOnly>,
  breaks: { [breakpoint: string] : Ref<boolean> },
  orientation: Ref<'none' | 'portrait' | 'landscape'>,
}

export type UseSizeOptions = {
  breakpoints?: { [breakpoint: string]: number },
}

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
  const pixels = ref<DOMRectReadOnly>(null)
  on<'resize'>({
    element: ensureElementFromExtendable(extendable),
    effects: defineEffect => [
     defineEffect(
        'resize',
        entries => pixels.value = entries[0].contentRect,
     ), 
    ]
  })


  // BREAKS
  const sorted = toEntries(breakpoints).sort(([, pixelsA], [, pixelsZ]) => pixelsZ - pixelsA),
        withNone: [string, number][] = sorted[0][1] > 0 ? [['none', 0], ...sorted] : sorted,
        assertions = withNone.map(([, p]) => pixels => pixels >= p),
        breaks: Size['breaks'] = assertions.reduce((is, assertion, index) => {
          const breakpoint = withNone[index][0]
          is[breakpoint] = computed(() => pixels.value ? assertion(pixels.value.width) : false)
          return is
        }, {})

  
  // ORIENTATION
  const orientation = computed(() => {
    if (!pixels.value) {
      return 'none'
    }

    return pixels.value?.width <= pixels.value?.height ? 'portrait' : 'landscape'
  })


  // API
  return {
    pixels,
    breaks,
    orientation,
  }
}
