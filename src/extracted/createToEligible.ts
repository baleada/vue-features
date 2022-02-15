import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { Navigateable } from '@baleada/logic'

export type ToEligibility = (index: number) => 'eligible' | 'ineligible'

export function createToNextEligible({ elementsApi, loops }: {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  loops: boolean,
}) {
  return ({ index, toEligibility }: { index: number, toEligibility: ToEligibility }) => {
    if (elementsApi.elements.value.length === 0) {
      return 'none'
    }
    
    const limit = (() => {
            if (loops) {
              return index < 1 ? elementsApi.elements.value.length - 1 : index - 1
            }
  
            return elementsApi.elements.value.length - 1
          })(),
          n = new Navigateable(elementsApi.elements.value).navigate(index, { allow: 'any' })
    
    let nextEligible: number | 'none' = 'none', didReachLimit = false
    while (nextEligible === 'none' && !didReachLimit) {
      n.next({ loops })
      didReachLimit = n.location === limit
  
      if (toEligibility(n.location) === 'eligible') {
        nextEligible = n.location
      }
    }

    return nextEligible
  }
}

export function createToPreviousEligible ({ elementsApi, loops }: {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  loops: boolean,
}) {
  return ({ index, toEligibility }: { index: number, toEligibility: ToEligibility }) => {
    if (elementsApi.elements.value.length === 0) {
      return 'none'
    }

    const limit = (() => {
            if (loops) {
              return index > elementsApi.elements.value.length - 2 ? 0 : index + 1
            }
  
            return 0
          })(),
          n = new Navigateable(elementsApi.elements.value).navigate(index, { allow: 'any' })
    
    let previousEligible: number | 'none' = 'none', didReachLimit = false
    while (previousEligible === 'none' && !didReachLimit) {
      n.previous({ loops })
      didReachLimit = n.location === limit
  
      if (toEligibility(n.location) === 'eligible') {
        previousEligible = n.location
      }
    }

    return previousEligible
  }
}
