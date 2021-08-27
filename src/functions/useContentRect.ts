import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import { toEntries, useSingleElement } from '../extracted'
import type { SingleElement } from '../extracted'

export type ContentRect = {
  root: SingleElement<HTMLElement>,
  pixels: Ref<DOMRectReadOnly>,
  breaks: { [breakpoint: string] : Ref<boolean> },
  orientation: Ref<'none' | 'portrait' | 'landscape'>,
}

export type UseContentRectOptions = {
  breakpoints?: { [breakpoint: string]: number },
}

const defaultOptions: UseContentRectOptions = {
  // Defaults to Tailwind breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
}

export function useContentRect (options: UseContentRectOptions = {}): ContentRect {
  // PARAMETER PROCESSING
  const { breakpoints } = { ...defaultOptions, ...options }


  // TARGET SETUP
  const root = useSingleElement()


  // PIXELS
  const pixels = ref<DOMRectReadOnly>(null)
  on<'resize'>({
    element: root.element,
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
        breaks: ContentRect['breaks'] = assertions.reduce((is, assertion, index) => {
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
    root,
    pixels,
    breaks,
    orientation,
  }
}
