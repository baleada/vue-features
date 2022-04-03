import type { IdentifiedListApi } from './useElementApi'
import { Navigateable } from '@baleada/logic'

export type ToListEligibility = (index: number) => 'eligible' | 'ineligible'

export function createToNextEligible({ list, loops }: {
  list: IdentifiedListApi<HTMLElement>,
  loops: boolean,
}) {
  return (index: number, toEligibility: ToListEligibility) => {
    if (list.elements.value.length === 0) {
      return 'none'
    }
    
    const limit = (() => {
            if (loops) {
              return index < 1 ? list.elements.value.length - 1 : index - 1
            }
  
            return list.elements.value.length - 1
          })(),
          n = new Navigateable(list.elements.value).navigate(index, { allow: 'any' })
    
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

export function createToPreviousEligible ({ list, loops }: {
  list: IdentifiedListApi<HTMLElement>,
  loops: boolean,
}) {
  return (index: number, toEligibility: ToListEligibility) => {
    if (list.elements.value.length === 0) {
      return 'none'
    }

    const limit = (() => {
            if (loops) {
              return index > list.elements.value.length - 2 ? 0 : index + 1
            }
  
            return 0
          })(),
          n = new Navigateable(list.elements.value).navigate(index, { allow: 'any' })
    
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
