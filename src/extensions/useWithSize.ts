import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { createMap, createReduce } from '@baleada/logic'
import { on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { toEntries, narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type WithSize<Breakpoints extends Record<string, number>> = {
  contentRect: Ref<DOMRectReadOnly>,
  borderBox: Ref<{ height: number, width: number }>,
  contentBox: Ref<{ height: number, width: number }>,
  breaks: Ref<Record<keyof Breakpoints | 'zero', boolean>>,
  orientation: Ref<'none' | 'portrait' | 'landscape'>,
}

export type UseWithSizeOptions<Breakpoints extends Record<string, number>> = {
  breakpoints?: Breakpoints,
} & OnEffectConfig<HTMLElement, 'resize'>['options']['listen']

const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

const defaultOptions: UseWithSizeOptions<typeof tailwindBreakpoints> = {
  breakpoints: tailwindBreakpoints,
}

export function useWithSize<Breakpoints extends Record<string, number> = typeof tailwindBreakpoints> (
  extendable: ExtendableElement,
  options: UseWithSizeOptions<Breakpoints> = {}
): WithSize<Breakpoints> {
  // OPTIONS
  const { breakpoints } = { ...defaultOptions, ...options }


  // RECT, BORDERBOX, CONTENTBOX
  const contentRect = ref<WithSize<any>['contentRect']['value']>(),
        borderBox = ref<WithSize<any>['borderBox']['value']>(),
        contentBox = ref<WithSize<any>['contentBox']['value']>()

  on(
    narrowElement(extendable),
    {
      resize: {
        createEffect: () => entries => {
          contentRect.value = entries[0].contentRect

          // Optional chaining makes `borderBox` and `contentBox` safe for older Safari

          borderBox.value = {
            height: entries[0].borderBoxSize?.[0]?.blockSize || 0,
            width: entries[0].borderBoxSize?.[0]?.inlineSize || 0,
          }

          contentBox.value = {
            height: entries[0].contentBoxSize?.[0]?.blockSize || 0,
            width: entries[0].contentBoxSize?.[0]?.inlineSize || 0,
          }
        },
        options: {
          listen: {
            observe: options.observe || {},
          },
        },
      },
    }
  )


  // BREAKS
  const sorted = toEntries(breakpoints).sort(([, pixelsA], [, pixelsZ]) => pixelsZ - pixelsA) as [keyof Breakpoints, number][],
        withZero: [keyof Breakpoints | 'zero', number][] = sorted[0][1] > 0 ? [['zero', 0], ...sorted] : sorted,
        assertions = createMap<typeof withZero[0], (pixels: number) => boolean>(
          ([, p]) => pixels => pixels >= p
        )(withZero),
        breaks: WithSize<Breakpoints>['breaks'] = computed(() => createReduce<typeof assertions[0], WithSize<Breakpoints>['breaks']['value']>(
          (breaks, assertion, index) => {
            const breakpoint = withZero[index][0]
            breaks[breakpoint] = width.value ? assertion(width.value) : false
            return breaks
          },
          {} as WithSize<Breakpoints>['breaks']['value']
        )(assertions)),
        width = computed(() => borderBox.value?.width || contentRect.value?.width || false)


  // ORIENTATION
  const orientation = computed(() => {
    if (!contentRect.value || contentRect.value.width === contentRect.value.height) {
      return 'none'
    }

    return contentRect.value.width < contentRect.value.height
      ? 'portrait'
      : 'landscape'
  })


  // API
  return {
    contentRect,
    borderBox,
    contentBox,
    breaks,
    orientation,
  }
}
