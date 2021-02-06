import { ref, computed } from 'vue'
import { useListenables } from '../affordances'

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

export default function useWidth (options = {}) {
  const { breakpoints } = { ...defaultOptions, ...options },
        sorted = Object.entries(breakpoints).sort(([, pixelsA], [, pixelsB]) => pixelsB - pixelsA),
        withNone = sorted[0][1] > 0 ? [['none', 0], ...sorted] : sorted,
        assertions = withNone.map(([, p]) => pixels => pixels >= p),
        pixels = ref(0),
        element = ref(null)

  useListenables({
    target: element,
    listenables: {
      resize: ({ 0: { contentRect: { width } } }) => (pixels.value = width),
    }
  })

  return {
    ref: () => el => (element.value = el),
    pixels,
    breaks: assertions.reduce((is, assertion, index) => ({
      ...is,
      [withNone[index][0]]: computed(() => assertion(pixels.value))
    }), {})
  }
}
