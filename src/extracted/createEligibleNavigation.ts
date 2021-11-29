import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligible'
import type { ToEligibility } from './createToEligible'

type BaseEligibleNavigationOptions = { toEligibility?: ToEligibility }

/**
 * Creates methods for navigating only to elements that are considered possible locations, e.g. the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleNavigation (
  {
    disabledElementsAreEligibleLocations,
    navigateable,
    loops,
    ability,
    elementsApi,
    getAbility,
  }: {
    disabledElementsAreEligibleLocations: boolean,
    navigateable: Ref<Navigateable<HTMLElement>>,
    loops: boolean,
    ability:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  previous: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
} {
  const exact: ReturnType<typeof createEligibleNavigation>['exact'] = (index, options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.value).navigate(index),
                possibility = options.toEligibility({ index: n.location, element: elementsApi.elements.value[n.location] })

          if (disabledElementsAreEligibleLocations && possibility === 'eligible') {
            navigateable.value.navigate(index)
            return getAbility(index)
          }

          if (getAbility(index) === 'enabled' && possibility === 'eligible') {
            navigateable.value.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createEligibleNavigation>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          return next(-1, { toEligibility: options.toEligibility })
        },
        last: ReturnType<typeof createEligibleNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          return previous(elementsApi.elements.value.length, { toEligibility: options.toEligibility })
        },
        random: ReturnType<typeof createEligibleNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.value)

          if (options.toEligibility({ index: n.location, element: elementsApi.elements.value[n.location] }) === 'eligible') {
            return exact(n.random().location)
          }

          return 'none'
        },
        next: ReturnType<typeof createEligibleNavigation>['next'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === navigateable.value.array.length - 1) {
            return 'none'
          }
          
          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextEligible = toNextEligible({ index, toEligibility: options.toEligibility })
            
            if (typeof nextEligible === 'number') {
              navigateable.value.navigate(nextEligible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }

          const nextEligible = toNextEligible({
            index,
            toEligibility: ({ index, element }) => (getAbility(index) === 'enabled' && options.toEligibility({ index, element })) ? 'eligible' : 'ineligible',
          })
            
          if (typeof nextEligible === 'number') {
            navigateable.value.navigate(nextEligible)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ elementsApi, loops }),
        previous: ReturnType<typeof createEligibleNavigation>['previous'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousEligible = toPreviousEligible({ index, toEligibility: options.toEligibility })
            
            if (typeof previousEligible === 'number') {
              navigateable.value.navigate(previousEligible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }
          
          const previousEligible = toPreviousEligible({
            index,
            toEligibility: ({ index, element }) => (getAbility(index) === 'enabled' && options.toEligibility({ index, element })) ? 'eligible' : 'ineligible',
          })
        
          if (typeof previousEligible === 'number') {
            navigateable.value.navigate(previousEligible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ elementsApi, loops })

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
