import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { ListApi } from './useListApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInList'
import type { ToListEligibility } from './createToEligibleInList'

type BaseEligibleNavigateApiOptions = { toEligibility?: ToListEligibility }

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInListNavigateApi<Meta extends { ability: 'enabled' | 'disabled' }> (
  {
    navigateable,
    api,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    navigateable: ShallowReactive<Navigateable<HTMLElement>>,
    api: ListApi<HTMLElement, true, Meta>,
    disabledElementsAreEligibleLocations: boolean,
    loops: boolean,
  }
): {
  exact: (index: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  previous: (index: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
} {
  const getAbility = (index: number) => api.meta.value[index].ability || 'enabled',
        exact: ReturnType<typeof createEligibleInListNavigateApi>['exact'] = (index, options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(api.list.value).navigate(index),
                eligibility = options.toEligibility(n.location)

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            navigateable.navigate(index)
            return getAbility(index)
          }

          if (getAbility(index) === 'enabled' && eligibility === 'eligible') {
            navigateable.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createEligibleInListNavigateApi>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          return next(-1, { toEligibility: options.toEligibility })
        },
        last: ReturnType<typeof createEligibleInListNavigateApi>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          return previous(api.list.value.length, { toEligibility: options.toEligibility })
        },
        random: ReturnType<typeof createEligibleInListNavigateApi>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(api.list.value).random()

          if (options.toEligibility(n.location) === 'eligible') {
            return exact(n.location)
          }

          return 'none'
        },
        next: ReturnType<typeof createEligibleInListNavigateApi>['next'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === navigateable.array.length - 1) {
            return 'none'
          }
          
          if (disabledElementsAreEligibleLocations) {
            const nextEligible = toNextEligible(index, options.toEligibility)
            
            if (typeof nextEligible === 'number') {
              navigateable.navigate(nextEligible)
              return getAbility(navigateable.location)
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
            navigateable.navigate(nextEligible)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api: api, loops }),
        previous: ReturnType<typeof createEligibleInListNavigateApi>['previous'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (disabledElementsAreEligibleLocations) {
            const previousEligible = toPreviousEligible(index, options.toEligibility)
            
            if (typeof previousEligible === 'number') {
              navigateable.navigate(previousEligible)
              return getAbility(navigateable.location)
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
            navigateable.navigate(previousEligible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api: api, loops })

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
  // TODO: Watch meta?
  watch(
    [api.status, api.list],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentList } = currentSources

      if (status.order === 'changed') {
        const { 1: previousList } = previousSources,
              index = findIndex<HTMLElement>(element => element === previousList[navigateable.location])(currentList) as number
        
        if (index > -1) {
          exact(index)
          return
        }
        
        first()
        return
      }

      if (status.length === 'shortened') {
        // Conditional rendering empties array
        if (currentList.length === 0) return

        if (navigateable.location > currentList.length - 1) {
          last()
          return
        }
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
    random,
  }
}
