import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { createMap, createReduce } from '@baleada/logic'
import { on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { toEntries, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Size<Breakpoints extends Record<string, number>> = {
  rect: Ref<DOMRectReadOnly>,
  breaks: Ref<Record<keyof Breakpoints, boolean>>,
  orientation: Ref<'none' | 'portrait' | 'landscape'>,
}

export type UseSizeOptions<Breakpoints extends Record<string, number>> = {
  breakpoints?: Breakpoints,
} & OnEffectConfig<HTMLElement, 'resize'>['options']['listen']

const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

const defaultOptions: UseSizeOptions<typeof tailwindBreakpoints> = {
  // Defaults to Tailwind breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
}

export function useSize<Breakpoints extends Record<string, number>> (
  extendable: Extendable,
  options: UseSizeOptions<Breakpoints> = {}
): Size<Breakpoints> {
  // OPTIONS
  const { breakpoints } = { ...defaultOptions, ...options }


  // PIXELS
  const rect = ref<DOMRectReadOnly>()
  on(
    ensureElementFromExtendable(extendable),
    {
      resize: {
        createEffect: () => entries => rect.value = entries[0].contentRect,
        options: {
          listen: {
            observe: options.observe || {},
          }
        }
      }
    }
  )


  // BREAKS
  const sorted = toEntries(breakpoints).sort(([, pixelsA], [, pixelsZ]) => pixelsZ - pixelsA) as [keyof Breakpoints, number][],
        withZero: [keyof Breakpoints | 'zero', number][] = sorted[0][1] > 0 ? [['zero', 0], ...sorted] : sorted,
        assertions = createMap<typeof withZero[0], (pixels: number) => boolean>(
          ([, p]) => pixels => pixels >= p
        )(withZero),
        breaks: Size<Breakpoints>['breaks'] = computed(() => createReduce<typeof assertions[0], Size<Breakpoints>['breaks']['value']>(
          (breaks, assertion, index) => {
            const breakpoint = withZero[index][0]
            breaks[breakpoint] = rect.value ? assertion(rect.value.width) : false
            return breaks
          },
          {} as Size<Breakpoints>['breaks']['value']
        )(assertions))

  
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
