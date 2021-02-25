import { ref, computed } from 'vue'
import { on } from '../affordances'
import { useTarget } from '../util'

const defaultOptions = {
  // Defaults to Tailwind breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
}

export default function useContentRect (options = {}) {
  // PARAMETER PROCESSING
  const { breakpoints } = { ...defaultOptions, ...options }


  // TARGET SETUP
  const element = useTarget('single')


  // PIXELS
  const pixels = ref(null)
  on({
    target: element.target,
    events: {
      resize: ({ 0: { contentRect } }) => (pixels.value = contentRect),
    }
  })


  // BREAKS
  const sorted = Object.entries(breakpoints).sort(([, pixelsA], [, pixelsB]) => pixelsB - pixelsA),
        withNone = sorted[0][1] > 0 ? [['none', 0], ...sorted] : sorted,
        assertions = withNone.map(([, p]) => pixels => pixels >= p),
        breaks = assertions.reduce((is, assertion, index) => ({
          ...is,
          [withNone[index][0]]: computed(() => assertion(pixels.value.width))
        }), {})

  return {
    element: element.api,
    pixels,
    breaks,
  }
}
