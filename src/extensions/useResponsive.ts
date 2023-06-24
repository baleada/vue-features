import type { Ref } from 'vue'
import { computed } from 'vue'
import { find } from 'lazy-collections'
import { useSize } from '../extensions'
import { useBody } from '../extracted'
import { useCategorized } from './useCategorized'

type UseResponsiveConfig<Value extends any> = {
  default: Value | Ref<Value>,
  byCategory: Partial<Record<Breakpoint, Value>> | Ref<Partial<Record<Breakpoint, Value>>>,
}

const breakpointsFromLargestToSmallest = [
  '2xl' as const,
  'xl' as const,
  'lg' as const,
  'md' as const,
  'sm' as const,
]

type Breakpoint = typeof breakpointsFromLargestToSmallest[number]

export function useResponsive<Value extends any> (config: UseResponsiveConfig<Value>) {
  const { default: defaultValue, byCategory } = config,
        body = useBody(),
        size = useSize(body.element),
        category = computed(() => {
          return find<typeof breakpointsFromLargestToSmallest[number]>(
            breakpoint => size.breaks.value[breakpoint]
          )(breakpointsFromLargestToSmallest) as typeof breakpointsFromLargestToSmallest[number]
        })

  return useCategorized(
    { default: defaultValue, byCategory, category },
    { priority: breakpointsFromLargestToSmallest }
  )
}

export function createUseResponsive<Value extends any> (defaultValue: UseResponsiveConfig<Value>['default']) {
  return function (byCategory: UseResponsiveConfig<Value>['byCategory']) {
    return useResponsive({ default: defaultValue, byCategory })
  }
}
