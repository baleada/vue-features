import { ref, computed, type Ref } from 'vue'
import { createMap } from '@baleada/logic'
import { on, type OnEffectConfig } from '../affordances'
import {
  toEntries,
  narrowElement,
  type ExtendableElement,
  type SupportedElement,
} from '../extracted'

export type Size<Breakpoints extends Record<string, number> = typeof tailwindBreakpoints> = {
  contentRect: Ref<Omit<DOMRectReadOnly, 'toJSON'>>,
  borderBox: Ref<{ width: number, height: number }>,
  contentBox: Ref<{ width: number, height: number }>,
  breaks: Ref<{
    width: Breaks<Breakpoints>,
    height: Breaks<Breakpoints>,
  }>,
  orientation: Ref<'none' | 'portrait' | 'landscape'>,
}

type Breaks<Breakpoints extends Record<string, number>> = Record<keyof Breakpoints | 'zero', boolean>

export type UseSizeOptions<Breakpoints extends Record<string, number>> = {
  breakpoints?: Breakpoints,
} & OnEffectConfig<SupportedElement, 'resize'>['options']['listen']

const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

const defaultOptions: UseSizeOptions<typeof tailwindBreakpoints> = {
  breakpoints: tailwindBreakpoints,
}

export function useSize<Breakpoints extends Record<string, number> = typeof tailwindBreakpoints> (
  extendable: ExtendableElement,
  options: UseSizeOptions<Breakpoints> = {}
): Size<Breakpoints> {
  // OPTIONS
  const { breakpoints } = { ...defaultOptions, ...options }


  // CONTENTRECT, BORDERBOX, CONTENTBOX
  const contentRect = ref<Size<any>['contentRect']['value']>({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
          x: 0,
          y: 0,
        }),
        borderBox = ref<Size<any>['borderBox']['value']>({ width: 0, height: 0 }),
        contentBox = ref<Size<any>['contentBox']['value']>({ width: 0, height: 0 })

  on(
    narrowElement(extendable),
    {
      resize: {
        createEffect: () => entries => {
          contentRect.value = entries[0].contentRect.toJSON()

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
        breaks: Size<Breakpoints>['breaks'] = computed(() => {
          const width = borderBox.value?.width || contentRect.value?.width || false,
                height = borderBox.value?.height || contentRect.value?.height || false,
                breaks = { width: {}, height: {} } as Size<Breakpoints>['breaks']['value']

          for (let i = 0; i < assertions.length; i++) {
            const breakpoint = withZero[i][0],
                  assertion = assertions[i]

            breaks.width[breakpoint] = !!width && assertion(width)
            breaks.height[breakpoint] = !!height && assertion(height)
          }

          return breaks
        })


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
