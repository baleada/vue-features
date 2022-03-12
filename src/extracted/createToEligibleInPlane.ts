import type { IdentifiedPlaneApi } from './useElementApi'
import { Navigateable } from '@baleada/logic'

export type ToEligibility = (row: number, column: number) => 'eligible' | 'ineligible'

export function createToNextEligible({ elementsApi, loops }: {
  elementsApi: IdentifiedPlaneApi<HTMLElement>,
  loops: boolean,
}) {
  return (
    row: number,
    column: number,
    direction: 'row' | 'column',
    toEligibility: ToEligibility,
  ): [row: number, column: number] | 'none' => {
    if (elementsApi.elements.value.length === 0 || elementsApi.elements.value[0].length === 0) return 'none'
    
    const limit = (() => {
            if (direction === 'row') {
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
            direction === 'row'
              ? new Navigateable(elementsApi.elements.value)
              : new Navigateable(elementsApi.elements.value[row])
          ).navigate(
            direction === 'row' ? row : column,
            { allow: 'any' }
          )
    
    let nextEligible: number | 'none' = 'none', didReachLimit = false
    while (nextEligible === 'none' && !didReachLimit) {
      n.next({ loops })
      didReachLimit = n.location === limit
  
      const eligibility = toEligibility(
        direction === 'row' ? n.location : row,
        direction === 'row' ? column : n.location
      )

      if (eligibility === 'eligible') {
        nextEligible = n.location
      }
    }

    if (nextEligible === 'none') return nextEligible
    
    return direction === 'row'
      ? [nextEligible, column]
      : [row, nextEligible]
  }
}

export function createToPreviousEligible ({ elementsApi, loops }: {
  elementsApi: IdentifiedPlaneApi<HTMLElement>,
  loops: boolean,
}) {
  return (
    row: number,
    column: number,
    direction: 'row' | 'column',
    toEligibility: ToEligibility,
  ): [row: number, column: number] | 'none' => {
    if (elementsApi.elements.value.length === 0 || elementsApi.elements.value[0].length === 0) return 'none'

    const limit = (() => {
            if (direction === 'row') {
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
            direction === 'row'
              ? new Navigateable(elementsApi.elements.value)
              : new Navigateable(elementsApi.elements.value[row])
          ).navigate(
            direction === 'row' ? row : column,
            { allow: 'any' }
          )
    
    let previousEligible: number | 'none' = 'none', didReachLimit = false
    while (previousEligible === 'none' && !didReachLimit) {
      n.previous({ loops })
      didReachLimit = n.location === limit

      const eligibility = toEligibility(
        direction === 'row' ? n.location : row,
        direction === 'row' ? column : n.location
      )
  
      if (eligibility === 'eligible') {
        previousEligible = n.location
      }
    }

    if (previousEligible === 'none') return previousEligible
    
    return direction === 'row'
      ? [previousEligible, column]
      : [row, previousEligible]
  }
}
