import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { IdentifiedListApi } from './useElementApi'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInList'
import type { ToEligibility } from './createToEligibleInList'

type BaseEligibleNavigationOptions = { toEligibility?: ToEligibility }

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInListNavigation (
  {
    navigateable,
    ability,
    elementsApi,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    navigateable: Ref<Navigateable<HTMLElement>>,
    ability: StatusOption<Ref<HTMLElement[]>, 'enabled' | 'disabled'>,
    elementsApi: IdentifiedListApi<HTMLElement>,
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
  const getAbility = ensureGetStatus(elementsApi.elements, ability),
        exact: ReturnType<typeof createEligibleInListNavigation>['exact'] = (index, options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.value).navigate(index),
                eligibility = options.toEligibility(n.location)

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
        first: ReturnType<typeof createEligibleInListNavigation>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          return next(-1, { toEligibility: options.toEligibility })
        },
        last: ReturnType<typeof createEligibleInListNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          return previous(elementsApi.elements.value.length, { toEligibility: options.toEligibility })
        },
        random: ReturnType<typeof createEligibleInListNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.value)

          if (options.toEligibility(n.location) === 'eligible') {
            return exact(n.random().location)
          }

          return 'none'
        },
        next: ReturnType<typeof createEligibleInListNavigation>['next'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === navigateable.value.array.length - 1) {
            return 'none'
          }
          
          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextEligible = toNextEligible(index, options.toEligibility)
            
            if (typeof nextEligible === 'number') {
              navigateable.value.navigate(nextEligible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }

          const nextEligible = toNextEligible(
            index,
            index => getAbility(index) === 'enabled'
              ? options.toEligibility(index)
              : 'ineligible',
          )
            
          if (typeof nextEligible === 'number') {
            navigateable.value.navigate(nextEligible)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ elementsApi, loops }),
        previous: ReturnType<typeof createEligibleInListNavigation>['previous'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousEligible = toPreviousEligible(index, options.toEligibility)
            
            if (typeof previousEligible === 'number') {
              navigateable.value.navigate(previousEligible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }
          
          const previousEligible = toPreviousEligible(
            index,
            index => getAbility(index) === 'enabled'
              ? options.toEligibility(index)
              : 'ineligible',
          )
        
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
