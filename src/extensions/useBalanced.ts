import type { ComputedRef } from 'vue'
import { ref, onMounted, watch } from 'vue'
import { some } from 'lazy-collections'
import { narrowElementFromExtendable, useElementApi } from '../extracted'
import type { Extendable, ElementApi } from '../extracted'
import { useSize } from './useSize'
import { computed } from '@vue/reactivity'

export type Balanced = {
  root: ElementApi<HTMLElement>,
  width: ComputedRef<number>,
}

export type UseBalancedOptions = {
  precision?: number,
  effort?: number,
}

const defaultOptions: UseBalancedOptions = {
  precision: 10,
  effort: 10,
}

export function useBalanced (extendable: Extendable, options: UseBalancedOptions = {}): Balanced {
  // OPTIONS
  const { precision, effort } = { ...defaultOptions, ...options }


  // ELEMENTS
  const element = narrowElementFromExtendable(extendable),
        root = useElementApi()

        
  // WIDTH
  const width = ref<number>(),
        size = useSize(element),
        resizeEffect = () => {
          const max = size.rect.value.width + precision,
                min = size.rect.value.width / 2,
                previousCandidates: number[] = [
                  max * effort,
                  min * effort,
                ],
                previousCandidatesIncludes = (candidate: number) => some(
                  previousCandidate => previousCandidate === candidate
                )(previousCandidates) as boolean,
                test = (candidate: number) => {
                  root.element.value.style.width = `${candidate}px`
                  const isVisible = root.element.value.clientHeight <= size.rect.value.height
              
                  root.element.value.style.width = `${candidate - precision}px`
                  const minusPrecisionIsVisible = root.element.value.clientHeight <= size.rect.value.height
              
                  return { isVisible, minusPrecisionIsVisible }
                }

          let result: number
          let resultType: 'ensured' | 'duplicate' = 'ensured'
          function binarySearch (candidate: number) {
            if (previousCandidatesIncludes(Math.round(candidate * effort))) {
              result = candidate - precision
              resultType = 'duplicate'
              return
            }

            previousCandidates.push(Math.round(candidate * effort))

            const { isVisible, minusPrecisionIsVisible } = test(candidate)

            if (isVisible && minusPrecisionIsVisible === false) {
              result = candidate
              return
            }

            if (!isVisible) {
              binarySearch(toCandidate(candidate, max))
              return
            }

            binarySearch(toCandidate(min, candidate))
            return
          }

          let resultIsVisible: boolean
          function ensure () {
            root.element.value.style.width = `${result}px`
            resultIsVisible = root.element.value.clientHeight <= size.rect.value.height
            if (resultIsVisible || result >= max) return

            result += precision
            ensure()
            return
          }

          binarySearch(toCandidate(min, max))
          // @ts-expect-error
          if (resultType === 'duplicate') ensure()
          width.value = result
        }
  
  onMounted(() => {
    watch(size.rect, resizeEffect)
  })


  // API
  return {
    root,
    width: computed(() => width.value)
  }
}

function toCandidate (min: number, max: number) {
  return (min + max) / 2
}
