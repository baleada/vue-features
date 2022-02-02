import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligible'
import type { ToEligibility } from './createToEligible'

type BaseEligibleNavigationOptions = { toEligibility?: ToEligibility }

/**
 * Creates methods for navigating only to elements that are considered possible locations, e.g. the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleNavigation (
  {
    navigateable,
    ability,
    elementsApi,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    navigateable: Ref<Navigateable<HTMLElement>>,
    ability:  StatusOption<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    disabledElementsAreEligibleLocations: boolean,
    loops: boolean,
  }
): {
  exact: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  previous: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
} {
  const getAbility = ensureGetStatus({ element: elementsApi.elements, status: ability }),
        exact: ReturnType<typeof createEligibleNavigation>['exact'] = (index, options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.value).navigate(index),
                eligibility = options.toEligibility({ index: n.location, element: elementsApi.elements.value[n.location] })

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            navigateable.value.navigate(index)
            return getAbility(index)
          }

          if (getAbility(index) === 'enabled' && eligibility === 'eligible') {
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
            toEligibility: ({ index, element }) => getAbility(index) === 'enabled'
              ? options.toEligibility({ index, element })
              : 'ineligible',
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
            toEligibility: ({ index, element }) => getAbility(index) === 'enabled'
              ? options.toEligibility({ index, element })
              : 'ineligible',
          })
        
          if (typeof previousEligible === 'number') {
            navigateable.value.navigate(previousEligible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ elementsApi, loops })

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
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
        last()
        return
      }
    },
    { flush: 'post' }
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
