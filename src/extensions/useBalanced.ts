import type { ComputedRef } from 'vue'
import { ref, watch } from 'vue'
import { some } from 'lazy-collections'
import { computed } from '@vue/reactivity'
import { narrowElement, useElementApi } from '../extracted'
import type { ExtendableElement, ElementApi, SupportedElement } from '../extracted'
import { useSize } from './useSize'

export type Balanced = {
  root: ElementApi<SupportedElement>,
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

// TODO: explore pseudo elements styled with css variables

export function useBalanced (extendable: ExtendableElement, options: UseBalancedOptions = {}): Balanced {
  // OPTIONS
  const { precision, effort } = { ...defaultOptions, ...options }


  // ELEMENTS
  const element = narrowElement(extendable),
        root = useElementApi()


  // WIDTH
  const width = ref<number>(),
        size = useSize(element),
        resizeEffect = () => {
          const max = size.borderBox.value.width + precision,
                min = size.borderBox.value.width / 2,
                previousCandidates: number[] = [
                  max * effort,
                  min * effort,
                ],
                previousCandidatesIncludes = (candidate: number) => some(
                  previousCandidate => previousCandidate === candidate
                )(previousCandidates) as boolean,
                test = (candidate: number) => {
                  root.element.value.style.width = `${candidate}px`
                  const isVisible = root.element.value.clientHeight <= size.borderBox.value.height

                  root.element.value.style.width = `${candidate - precision}px`
                  const minusPrecisionIsVisible = root.element.value.clientHeight <= size.borderBox.value.height

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
            resultIsVisible = root.element.value.clientHeight <= size.borderBox.value.height
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

  watch(size.borderBox, resizeEffect)


  // API
  return {
    root,
    width: computed(() => width.value),
  }
}

function toCandidate (min: number, max: number) {
  return (min + max) / 2
}
