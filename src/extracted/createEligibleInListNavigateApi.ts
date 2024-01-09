import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { ListApi } from './useListApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInList'
import type { ToListEligibility } from './createToEligibleInList'

export type EligibleInListNavigateApi = {
  exact: (index: number, options?: BaseEligibleInListNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: BaseEligibleInListNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  previous: (index: number, options?: BaseEligibleInListNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleInListNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleInListNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleInListNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
}

type BaseEligibleInListNavigateApiOptions = { toEligibility?: ToListEligibility }

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInListNavigateApi<Meta extends { ability?: 'enabled' | 'disabled' }> (
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
): EligibleInListNavigateApi {
  const getAbility = (index: number) => api.meta.value[index].ability || 'enabled',
        exact: EligibleInListNavigateApi['exact'] = (index, options = { toEligibility: () => 'eligible' }) => {
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
        first: EligibleInListNavigateApi['first'] = (options = { toEligibility: () => 'eligible' }) => {
          return next(-1, { toEligibility: options.toEligibility })
        },
        last: EligibleInListNavigateApi['last'] = (options = { toEligibility: () => 'eligible' }) => {
          return previous(api.list.value.length, { toEligibility: options.toEligibility })
        },
        random: EligibleInListNavigateApi['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(api.list.value).random()

          if (options.toEligibility(n.location) === 'eligible') {
            return exact(n.location)
          }

          return 'none'
        },
        next: EligibleInListNavigateApi['next'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (disabledElementsAreEligibleLocations) {
            const nextEligible = toNextEligible({
              index,
              loops,
              toEligibility: options.toEligibility,
            })
            
            if (typeof nextEligible === 'number') {
              navigateable.navigate(nextEligible)
              return getAbility(navigateable.location)
            }
  
            return 'none'
          }

          const nextEligible = toNextEligible({
            index,
            toEligibility: index => getAbility(index) === 'enabled'
              ? options.toEligibility(index)
              : 'ineligible',
            loops,
          })
            
          if (typeof nextEligible === 'number') {
            navigateable.navigate(nextEligible)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api: api }),
        previous: EligibleInListNavigateApi['previous'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (disabledElementsAreEligibleLocations) {
            const previousEligible = toPreviousEligible({
              index,
              loops,
              toEligibility: options.toEligibility,
            })
            
            if (typeof previousEligible === 'number') {
              navigateable.navigate(previousEligible)
              return getAbility(navigateable.location)
            }
  
            return 'none'
          }
          
          const previousEligible = toPreviousEligible({
            index,
            toEligibility: index => getAbility(index) === 'enabled'
              ? options.toEligibility(index)
              : 'ineligible',
            loops,
          })
        
          if (typeof previousEligible === 'number') {
            navigateable.navigate(previousEligible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api: api })

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
