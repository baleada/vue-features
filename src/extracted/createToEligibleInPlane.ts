import type { IdentifiedPlaneApi } from './useElementApi'
import { Navigateable } from '@baleada/logic'

export type ToEligibility = (row: number, column: number) => 'eligible' | 'ineligible'

export function createToNextEligible({ elementsApi, loops, iterateOver }: {
  elementsApi: IdentifiedPlaneApi<HTMLElement>,
  loops: boolean,
  iterateOver: 'row' | 'column',
}) {
  return (
    row: number,
    column: number,
    toEligibility: ToEligibility,
  ): [row: number, column: number] | 'none' => {
    if (elementsApi.elements.value.length === 0 || elementsApi.elements.value[0].length === 0) return 'none'
    
    const limit = (() => {
            if (iterateOver === 'row') {
              if (loops) {
                return row < 1 ? elementsApi.elements.value.length - 1 : row - 1
              }
    
              return elementsApi.elements.value.length - 1
            }

            if (loops) {
              return column < 1 ? elementsApi.elements.value[0].length - 1 : column - 1
            }
  
            return elementsApi.elements.value[0].length - 1
          })(),
          n = (
            iterateOver === 'row'
              ? new Navigateable(elementsApi.elements.value)
              : new Navigateable(elementsApi.elements.value[row])
          ).navigate(
            iterateOver === 'row' ? row : column,
            { allow: 'any' }
          )
    
    let nextEligible: number | 'none' = 'none', didReachLimit = false
    while (nextEligible === 'none' && !didReachLimit) {
      n.next({ loops })
      didReachLimit = n.location === limit
  
      const eligibility = toEligibility(
        iterateOver === 'row' ? n.location : row,
        iterateOver === 'row' ? column : n.location
      )

      if (eligibility === 'eligible') nextEligible = n.location
    }

    if (nextEligible === 'none') return nextEligible
    
    return iterateOver === 'row'
      ? [nextEligible, column]
      : [row, nextEligible]
  }
}

export function createToPreviousEligible ({ elementsApi, loops, iterateOver }: {
  elementsApi: IdentifiedPlaneApi<HTMLElement>,
  loops: boolean,
  iterateOver: 'row' | 'column',
}) {
  return (
    row: number,
    column: number,
    toEligibility: ToEligibility,
  ): [row: number, column: number] | 'none' => {
    if (elementsApi.elements.value.length === 0 || elementsApi.elements.value[0].length === 0) return 'none'

    const limit = (() => {
            if (iterateOver === 'row') {
              if (loops) {
                return row > elementsApi.elements.value.length - 2 ? 0 : row + 1
              }
    
              return 0
            }

            if (loops) {
              return column > elementsApi.elements.value[0].length - 2 ? 0 : column + 1
            }

            return 0
          })(),
          n = (
            iterateOver === 'row'
              ? new Navigateable(elementsApi.elements.value)
              : new Navigateable(elementsApi.elements.value[row])
          ).navigate(
            iterateOver === 'row' ? row : column,
            { allow: 'any' }
          )
    
    let previousEligible: number | 'none' = 'none', didReachLimit = false
    while (previousEligible === 'none' && !didReachLimit) {
      n.previous({ loops })
      didReachLimit = n.location === limit

      const eligibility = toEligibility(
        iterateOver === 'row' ? n.location : row,
        iterateOver === 'row' ? column : n.location
      )
  
      if (eligibility === 'eligible') previousEligible = n.location
    }

    if (previousEligible === 'none') return previousEligible
    
    return iterateOver === 'row'
      ? [previousEligible, column]
      : [row, previousEligible]
  }
}
