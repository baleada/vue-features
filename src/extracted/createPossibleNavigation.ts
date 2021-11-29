import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'

/**
 * Creates methods for navigating only to elements that are considered possible locations, e.g. the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createPossibleNavigation (
  {
    disabledElementsArePossibleLocations,
    navigateable,
    loops,
    ability,
    elementsApi,
    getAbility,
  }: {
    disabledElementsArePossibleLocations: boolean,
    navigateable: Ref<Navigateable<HTMLElement>>,
    loops: boolean,
    ability:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (index: number) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: { condition?: (index: number) => boolean, loops?: boolean }) => 'enabled' | 'disabled' | 'none',
  previous: (index: number) => 'enabled' | 'disabled' | 'none',
  first: (options?: { condition?: (index: number) => boolean }) => 'enabled' | 'disabled' | 'none',
  last: () => 'enabled' | 'disabled' | 'none',
  random: () => 'enabled' | 'disabled' | 'none',
} {
  const exact: ReturnType<typeof createPossibleNavigation>['exact'] = index => {
          if (disabledElementsArePossibleLocations) {
            navigateable.value.navigate(index)
            return getAbility(index)
          }

          const a = getAbility(index)

          if (a === 'enabled') {
            navigateable.value.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createPossibleNavigation>['first'] = (options = { condition: () => true }) => {
          return next(-1, { condition: options.condition })
        },
        last: ReturnType<typeof createPossibleNavigation>['last'] = () => {
          return previous(elementsApi.elements.value.length)
        },
        random: ReturnType<typeof createPossibleNavigation>['last'] = () => {
          const n = new Navigateable(elementsApi.elements.value)
          return exact(n.random().location)
        },
        next: ReturnType<typeof createPossibleNavigation>['next'] = (index, options = { condition: () => true }) => {
          if (!loops && index === navigateable.value.array.length - 1) {
            return 'none'
          }
          
          if (
            disabledElementsArePossibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextPossible = toNextPossible({ index, toIsPossible: options.condition })
            
            if (typeof nextPossible === 'number') {
              navigateable.value.navigate(nextPossible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }

          const nextPossible = toNextPossible({
            index,
            toIsPossible: index => getAbility(index) === 'enabled' && options.condition(index)
          })
            
          if (typeof nextPossible === 'number') {
            navigateable.value.navigate(nextPossible)
            return 'enabled'
          }

          return 'none'
        },
        toNextPossible = createToNextPossible({ elementsApi, navigateable, loops }),
        previous: ReturnType<typeof createPossibleNavigation>['previous'] = index => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (
            disabledElementsArePossibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousPossible = toPreviousPossible({ index, toIsPossible: () => true })
            
            if (typeof previousPossible === 'number') {
              navigateable.value.navigate(previousPossible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }
          
          const previousPossible = toPreviousPossible({
            index,
            toIsPossible: index => getAbility(index) === 'enabled'
          })
        
          if (typeof previousPossible === 'number') {
            navigateable.value.navigate(previousPossible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousPossible = createToPreviousPossible({ elementsApi, navigateable, loops })

  watch(
    [elementsApi.status, elementsApi.elements],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources

      if (status.order === 'changed') {
        const { 1: previousElements } = previousSources,
              index = findIndex<HTMLElement>(element => element.isSameNode(previousElements[navigateable.value.location]))(currentElements) as number
        
        if (typeof index === 'number') {
          exact(index)
          return
        }
        
        first()
        return
      }

      if (status.length === 'shortened' && navigateable.value.location > currentElements.length - 1) {
        console.log(previous(navigateable.value.location))
        return
      }
    }
  )

  return {
    exact,
    next,
    previous,
    first,
    last,
    random
  }
}

export function createToNextPossible({ elementsApi, navigateable, loops }: {
  navigateable: Ref<Navigateable<HTMLElement>>,
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  loops: boolean,
}) {
  return ({ index, toIsPossible }: { index: number, toIsPossible: (index: number) => boolean }) => {
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
  
      if (toIsPossible(n.location)) {
        nextPossible = n.location
      }
    }

    return nextPossible
  }
}

export function createToPreviousPossible ({ elementsApi, navigateable, loops }: {
  navigateable: Ref<Navigateable<HTMLElement>>,
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  loops: boolean,
}) {
  return ({ index, toIsPossible }: { index: number, toIsPossible: (index: number) => boolean }) => {
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
  
      if (toIsPossible(n.location)) {
        previousPossible = n.location
      }
    }

    return previousPossible
  }
}
