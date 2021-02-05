import { ref, onMounted } from 'vue'
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

export default function useTailwindBreakpoint ({ target }, options = {}) {
  const { screens } = { ...defaultOptions, ...options },
        findable = Object.entries(screens),
        toBreakpoint = width => findable.find(([_, pixels], index, array) => width >= pixels && width < array[index + 1]?.[1])?.[0],
        resize = useListenable('resize'),
        breakpoint = ref('none')

  onMounted(() => {
    resize.value.listen(
      ({ 0: { contentRect: { width } } }) => (breakpoint.value = toBreakpoint(width)),
      { target: target.value }
    )
  })

  return breakpoint
}
