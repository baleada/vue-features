import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'

/**
 * Creates methods for navigating only the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEnabledNavigation (
  {
    disabledElementsReceiveFocus,
    withAbility,
    loops,
    ability,
    elementsApi,
    getAbility,
  }: {
    disabledElementsReceiveFocus: boolean,
    withAbility: Ref<Navigateable<HTMLElement>>,
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
  const exact: ReturnType<typeof createEnabledNavigation>['exact'] = index => {
          if (disabledElementsReceiveFocus) {
            withAbility.value.navigate(index)
            return getAbility(index)
          }

          const a = getAbility(index)

          if (a === 'enabled') {
            withAbility.value.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createEnabledNavigation>['first'] = (options = { condition: () => true }) => {
          return next(-1, { condition: options.condition })
        },
        last: ReturnType<typeof createEnabledNavigation>['last'] = () => {
          return previous(elementsApi.elements.value.length)
        },
        random: ReturnType<typeof createEnabledNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          return exact(n.random().location)
        },
        next: ReturnType<typeof createEnabledNavigation>['next'] = (index, options = { condition: () => true }) => {
          if (!loops && index === withAbility.value.array.length - 1) {
            return 'none'
          }
          
          if (disabledElementsReceiveFocus || (typeof ability === 'string' && ability === 'enabled')) {
            const nextPossible = toNextPossible({ index, toIsPossible: options.condition })
            
            if (typeof nextPossible === 'number') {
              withAbility.value.navigate(nextPossible)
              return getAbility(withAbility.value.location)
            }
  
            return 'none'
          }
          
          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.next({ loops: loops })
              return 'enabled'
            }
        
            return 'none'
          }          

          const nextPossible = toNextPossible({ index, toIsPossible: index => getAbility(index) === 'enabled' && options.condition(index) })
            
          if (typeof nextPossible === 'number') {
            withAbility.value.navigate(nextPossible)
            return 'enabled'
          }

          return 'none'
        },
        toNextPossible = createToNextPossible({ elementsApi, withAbility, loops }),
        previous: ReturnType<typeof createEnabledNavigation>['previous'] = index => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (disabledElementsReceiveFocus) {
            withAbility.value.previous({ loops })
            return getAbility(withAbility.value.location)
          }
        
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.previous({ loops })
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.previous({ loops })
              return 'enabled'
            }
        
            return 'none'
          }
          
          const previousPossible = toPreviousPossible({ index, toIsPossible: index => getAbility(index) === 'enabled' })
        
          if (typeof previousPossible === 'number') {
            withAbility.value.navigate(previousPossible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousPossible = createToPreviousPossible({ elementsApi, withAbility, loops })

  watch(
    [elementsApi.status, elementsApi.elements],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources,
            { 1: previousElements } = previousSources

      if (status.order === 'changed') {
        const index = findIndex<HTMLElement>(element => element.isSameNode(previousElements[withAbility.value.location]))(currentElements) as number
        
        if (typeof index === 'number') {
          exact(index)
          return
        }
        
        first()
        return
      }

      if (status.length === 'shortened' && withAbility.value.location > currentElements.length - 1) {
        previous(withAbility.value.location)
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

export function createToNextPossible({ elementsApi, withAbility, loops }: {
  withAbility: Ref<Navigateable<HTMLElement>>,
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
          n = new Navigateable(withAbility.value.array).navigate(index, { allow: 'any' })
    
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

export function createToPreviousPossible ({ elementsApi, withAbility, loops }: {
  withAbility: Ref<Navigateable<HTMLElement>>,
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
          n = new Navigateable(withAbility.value.array).navigate(index, { allow: 'any' })
    
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
