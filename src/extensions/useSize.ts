import {
  ref,
  computed,
  type Ref,
  onMounted,
  onScopeDispose,
} from 'vue'
import { createMap } from '@baleada/logic'
import { on, type OnEffectConfig } from '../affordances'
import {
  toEntries,
  narrowElement,
  type ExtendableElement,
  type SupportedElement,
} from '../extracted'

export type Size<
  E extends (
    | ExtendableElement
    | (() => VisualViewport)
  ) = ExtendableElement,
  Breakpoints extends Record<string, number> = typeof defaultBreakpoints,
> = (
  & {
    breaks: Ref<{
      width: Breaks<Breakpoints>,
      height: Breaks<Breakpoints>,
    }>,
    orientation: Ref<'none' | 'portrait' | 'landscape'>,
  }
  & (
    E extends () => VisualViewport
      ? {
        box: Ref<{ width: number, height: number, scale: number }>,
        orientation: Ref<'none' | 'portrait' | 'landscape'>,
      }
      : {
        contentRect: Ref<Omit<DOMRectReadOnly, 'toJSON'>>,
        borderBox: Ref<{ width: number, height: number }>,
        contentBox: Ref<{ width: number, height: number }>,
      }
  )
)

type Breaks<Breakpoints extends Record<string, number>> = Record<keyof Breakpoints | 'zero', boolean>

export type UseSizeOptions<
  E extends (
    | ExtendableElement
    | (() => VisualViewport)
  ) = ExtendableElement,
  Breakpoints extends Record<string, number> = typeof defaultBreakpoints,
> = (
  & { breakpoints?: Breakpoints }
  & (
    E extends () => VisualViewport
      ? { addEventListener?: Parameters<VisualViewport['addEventListener']>[2] }
      : OnEffectConfig<SupportedElement, 'resize'>['options']['listen']
  )
)

const defaultBreakpoints = {
  zero: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

const defaultOptions: UseSizeOptions<any, typeof defaultBreakpoints> = {
  breakpoints: defaultBreakpoints,
}

export function useSize<
  E extends (
    | ExtendableElement
    | (() => VisualViewport)
  ) = ExtendableElement,
  Breakpoints extends Record<string, number> = typeof defaultBreakpoints,
> (
  extendableOrVisualViewportGetter: E,
  options: UseSizeOptions<E, Breakpoints> = {}
): Size<E, Breakpoints> {
  // OPTIONS
  const { breakpoints } = { ...defaultOptions, ...options } as UseSizeOptions<any, Breakpoints>


  // VISUAL VIEWPORT
  if (typeof extendableOrVisualViewportGetter === 'function') {
    const visualViewportGetter = extendableOrVisualViewportGetter as () => VisualViewport,
          { addEventListener } = { ...defaultOptions, ...options } as UseSizeOptions<() => VisualViewport, Breakpoints>

    const visualViewport = computed(visualViewportGetter),
          box: Size<() => VisualViewport>['box'] = ref({
            width: 0,
            height: 0,
            scale: 1,
          }),
          breaks: Size<() => VisualViewport, Breakpoints>['breaks'] = computed(
            createGetBreaks({
              breakpoints,
              getWidth: () => box.value.width,
              getHeight: () => box.value.height,
            })
          ),
          orientation: Size<() => VisualViewport, Breakpoints>['orientation'] = computed(
            createGetOrientation({
              getShouldOrient: () => !!visualViewport.value,
              getWidth: () => box.value.width,
              getHeight: () => box.value.height,
            })
          ),
          resizeEffect = () => {
            box.value = {
              width: visualViewport.value.width,
              height: visualViewport.value.height,
              scale: visualViewport.value.scale,
            }
          }

    onMounted(() => {
      resizeEffect()
      visualViewport.value.addEventListener('resize', resizeEffect, addEventListener)
    })

    onScopeDispose(() => {
      visualViewport.value.removeEventListener('resize', resizeEffect, addEventListener)
    })


    // API
    return {
      box,
      breaks,
      orientation,
    } as unknown as Size<E, Breakpoints>
  }


  // EXTENDABLE ELEMENT
  const { observe = {} } = { ...defaultOptions, ...options } as UseSizeOptions<ExtendableElement, Breakpoints>


  // CONTENTRECT, BORDERBOX, CONTENTBOX
  const contentRect = ref<Size<ExtendableElement>['contentRect']['value']>({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
          x: 0,
          y: 0,
        }),
        borderBox = ref<Size<ExtendableElement>['borderBox']['value']>({ width: 0, height: 0 }),
        contentBox = ref<Size<ExtendableElement>['contentBox']['value']>({ width: 0, height: 0 }),
        breaks: Size<ExtendableElement, Breakpoints>['breaks'] = computed(
          createGetBreaks({
            breakpoints,
            getWidth: () => borderBox.value.width || contentRect.value.width,
            getHeight: () => borderBox.value.height || contentRect.value.height,
          })
        ),
        orientation: Size<ExtendableElement, Breakpoints>['orientation'] = computed(
          createGetOrientation({
            getShouldOrient: () => !!contentRect.value,
            getWidth: () => contentRect.value.width,
            getHeight: () => contentRect.value.height,
          })
        )

  on(
    narrowElement(extendableOrVisualViewportGetter),
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
        options: { listen: { observe } },
      },
    }
  )


  // API
  return {
    contentRect,
    borderBox,
    contentBox,
    breaks,
    orientation,
  } as unknown as Size<E, Breakpoints>
}

function createGetBreaks<
  Breakpoints extends Record<string, number> = typeof defaultBreakpoints,
> ({
  breakpoints,
  getWidth,
  getHeight,
}: {
  breakpoints: Breakpoints,
  getWidth: () => number,
  getHeight: () => number,
}) {
  const sorted = toEntries(breakpoints).sort(([, pixelsA], [, pixelsZ]) => pixelsZ - pixelsA) as [keyof Breakpoints, number][],
        assertions = createMap<typeof sorted[0], (pixels: number) => boolean>(
          ([, p]) => pixels => pixels >= p
        )(sorted)

  return () => {
    const width = getWidth() ?? false,
          height = getHeight() ?? false,
          breaks = { width: {}, height: {} } as Size<any, Breakpoints>['breaks']['value']

    for (let i = 0; i < assertions.length; i++) {
      const breakpoint = sorted[i][0],
            assertion = assertions[i]

      breaks.width[breakpoint] = !!width && assertion(width)
      breaks.height[breakpoint] = !!height && assertion(height)
    }

    return breaks
  }
}

function createGetOrientation (
  { getShouldOrient, getWidth, getHeight }: {
    getShouldOrient: () => boolean,
    getWidth: () => number,
    getHeight: () => number,
  }
) {
  return () => {
    const shouldOrient = getShouldOrient(),
          width = getWidth(),
          height = getHeight()

    return (
      (!shouldOrient || width === height)
        ? 'none'
        : width < height
          ? 'portrait'
          : 'landscape'
    )
  }
}
