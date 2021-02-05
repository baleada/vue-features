import { ref, computed, onMounted } from 'vue'
import { useListenable } from '@baleada/vue-composition'

const defaultOptions = {
  screens: {
    none: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
}

export default function useBreakpointIs ({ target }, options = {}) {
  const { screens } = { ...defaultOptions, ...options },
        sorted = Object.entries(screens).sort(([, pixelsA], [, pixelsB]) => pixelsB - pixelsA),
        assertions = sorted.map(([, pixels]) => width => width >= pixels),
        resize = useListenable('resize'),
        width = ref(0)

  onMounted(() => {
    resize.value.listen(
      ({ 0: { contentRect: { width: w } } }) => (width.value = w),
      { target: target.value }
    )
  })

  return assertions.reduce((is, assertion, index) => ({
    ...is,
    [sorted[index][0]]: computed(() => assertion(width.value))
  }), {})
}
