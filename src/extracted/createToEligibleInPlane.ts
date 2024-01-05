import { Navigateable } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'

export type ToPlaneEligibility = (coordinates: [row: number, column: number]) => 'eligible' | 'ineligible'

export function createToNextEligible({ api, loops, iterateOver }: {
  api: PlaneApi<HTMLElement, true>,
  loops: boolean,
  iterateOver: 'row' | 'column',
}) {
  return (
    [row, column]: [row: number, column: number],
    toEligibility: ToPlaneEligibility,
  ): [row: number, column: number] | 'none' => {
    if (api.plane.value.length === 0 || api.plane.value[0].length === 0) return 'none'
    
    const limit = (() => {
            if (iterateOver === 'row') {
              if (loops) {
                return row < 1 ? api.plane.value.length - 1 : row - 1
              }
    
              return api.plane.value.length - 1
            }

            if (loops) {
              return column < 1 ? api.plane.value[0].length - 1 : column - 1
            }
  
            return api.plane.value[0].length - 1
          })(),
          n = (
            iterateOver === 'row'
              ? new Navigateable(api.plane.value)
              : new Navigateable(api.plane.value[row])
          ).navigate(
            iterateOver === 'row' ? row : column,
            { allow: 'any' }
          )
    
    let nextEligible: number | 'none' = 'none', didReachLimit = false
    while (nextEligible === 'none' && !didReachLimit) {
      n.next({ loops })
      didReachLimit = n.location === limit
  
      const eligibility = toEligibility([
        iterateOver === 'row' ? n.location : row,
        iterateOver === 'row' ? column : n.location,
      ])

      if (eligibility === 'eligible') nextEligible = n.location
    }

    if (nextEligible === 'none') return nextEligible
    
    return iterateOver === 'row'
      ? [nextEligible, column]
      : [row, nextEligible]
  }
}

export function createToPreviousEligible ({ api, loops, iterateOver }: {
  api: PlaneApi<HTMLElement, true>,
  loops: boolean,
  iterateOver: 'row' | 'column',
}) {
  return (
    [row, column]: [row: number, column: number],
    toEligibility: ToPlaneEligibility,
  ): [row: number, column: number] | 'none' => {
    if (api.plane.value.length === 0 || api.plane.value[0].length === 0) return 'none'

    const limit = (() => {
            if (iterateOver === 'row') {
              if (loops) {
                return row > api.plane.value.length - 2 ? 0 : row + 1
              }
    
              return 0
            }

            if (loops) {
              return column > api.plane.value[0].length - 2 ? 0 : column + 1
            }

            return 0
          })(),
          n = (
            iterateOver === 'row'
              ? new Navigateable(api.plane.value)
              : new Navigateable(api.plane.value[row])
          ).navigate(
            iterateOver === 'row' ? row : column,
            { allow: 'any' }
          )
    
    let previousEligible: number | 'none' = 'none', didReachLimit = false
    while (previousEligible === 'none' && !didReachLimit) {
      n.previous({ loops })
      didReachLimit = n.location === limit

      const eligibility = toEligibility([
        iterateOver === 'row' ? n.location : row,
        iterateOver === 'row' ? column : n.location,
      ])
  
      if (eligibility === 'eligible') previousEligible = n.location
    }

    if (previousEligible === 'none') return previousEligible
    
    return iterateOver === 'row'
      ? [previousEligible, column]
      : [row, previousEligible]
  }
}
