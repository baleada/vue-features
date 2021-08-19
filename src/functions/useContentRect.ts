import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { on } from '../affordances'
import { SingleTargetApi, useSingleTarget } from '../util'
import { ListenableSupportedType } from '@baleada/logic'

export type ContentRect = {
  element: SingleTargetApi,
  pixels: Ref<DOMRectReadOnly>,
  breaks: Record<string, Ref<boolean>>,
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
  const element = useSingleTarget()


  // PIXELS
  const pixels = ref<DOMRectReadOnly>(null)
  on<'resize'>({
    element: element.element,
    effects: defineEffect => [
     defineEffect(
        'resize',
        entries => (pixels.value = entries[0].contentRect),
     ), 
    ]
  })


  // BREAKS
  const sorted = Object.entries(breakpoints).sort(([, pixelsA], [, pixelsZ]) => pixelsZ - pixelsA),
        withNone: [string, number][] = sorted[0][1] > 0 ? [['none', 0], ...sorted] : sorted,
        assertions = withNone.map(([, p]) => pixels => pixels >= p),
        breaks: Record<string, Ref<boolean>> = assertions.reduce((is, assertion, index) => ({
          ...is,
          [withNone[index][0]]: computed(() => assertion(pixels.value.width))
        }), {})

  return {
    element: element.api,
    pixels,
    breaks,
  }
}
