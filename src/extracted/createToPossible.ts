import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { Navigateable } from '@baleada/logic'

export type ToPossibility = ({ index, element }: { index: number, element: HTMLElement }) => 'possible' | 'impossible'

export function createToNextPossible({ elementsApi, loops }: {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  loops: boolean,
}) {
  return ({ index, toPossibility }: { index: number, toPossibility: ToPossibility }) => {
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
    
    let nextPossible: number | 'none' = 'none', didReachLimit = false
    while (nextPossible === 'none' && !didReachLimit) {
      n.next({ loops })
      didReachLimit = n.location === limit
  
      if (toPossibility({ index: n.location, element: elementsApi.elements.value[n.location] }) === 'possible') {
        nextPossible = n.location
      }
    }

    return nextPossible
  }
}

export function createToPreviousPossible ({ elementsApi, loops }: {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  loops: boolean,
}) {
  return ({ index, toPossibility }: { index: number, toPossibility: ToPossibility }) => {
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
    
    let previousPossible: number | 'none' = 'none', didReachLimit = false
    while (previousPossible === 'none' && !didReachLimit) {
      n.previous({ loops })
      didReachLimit = n.location === limit
  
      if (toPossibility({ index: n.location, element: elementsApi.elements.value[n.location] }) === 'possible') {
        previousPossible = n.location
      }
    }

    return previousPossible
  }
}
