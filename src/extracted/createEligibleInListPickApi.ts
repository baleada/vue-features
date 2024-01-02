import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { findIndex } from 'lazy-collections'
import { createFilter, createReduce, Pickable } from '@baleada/logic'
import type { ListApi } from './useListApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInList'
import type { ToListEligibility } from './createToEligibleInList'

type BaseEligiblePickApiOptions = { toEligibility?: ToListEligibility }

const defaultEligiblePickApiOptions: BaseEligiblePickApiOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInListPickApi<Meta extends { ability: 'enabled' | 'disabled' }> (
  { pickable, api }: {
    pickable: ShallowReactive<Pickable<HTMLElement>>,
    api: ListApi<HTMLElement, true, Meta>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  next: (index: number, options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previous: (index: number, options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  all: (options?: BaseEligiblePickApiOptions) => 'enabled' | 'none',
} {
  const getAbility = (index: number) => api.meta.value[index].ability || 'enabled',
        exact: ReturnType<typeof createEligibleInListPickApi>['exact'] = (indexOrIndices, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                eligible = createFilter<number>(index =>
                  getAbility(index) === 'enabled'
                  && toEligibility(index) === 'eligible'
                )(
                  new Pickable(pickable.array)
                    .pick(indexOrIndices)
                    .picks
                )

          if (eligible.length > 0) {
            pickable.pick(eligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        next: ReturnType<typeof createEligibleInListPickApi>['next'] = (index, options = {}) => {
          if (index === pickable.array.length - 1) {
            return 'none'
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                nextEligible = toNextEligible(
                  index,
                  index => getAbility(index) === 'enabled'
                    ? toEligibility(index)
                    : 'ineligible',
                )
            
          if (typeof nextEligible === 'number') {
            pickable.pick(nextEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api: api, loops: false }),
        previous: ReturnType<typeof createEligibleInListPickApi>['next'] = (index, options = {}) => {          
          if (index === 0) {
            return 'none'
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                previousEligible = toPreviousEligible(
                  index,
                  index => getAbility(index) === 'enabled'
                    ? toEligibility(index)
                    : 'ineligible',
                )
        
          if (typeof previousEligible === 'number') {
            pickable.pick(previousEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api: api, loops: false }),
        all: ReturnType<typeof createEligibleInListPickApi>['all'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligiblePickApiOptions, ...options },
                newIndices: number[] = []
          
          for (let i = 0; i < pickable.array.length; i++) {
            if (getAbility(i) === 'enabled' && toEligibility(i) === 'eligible') {
              newIndices.push(i)
            }
          }

          if (newIndices.length > 0) {
            pickable.pick(newIndices)
            return 'enabled'
          }

          return 'none'
        }

  watch(
    [api.status, api.list, api.meta],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements, 2: currentMeta } = currentSources,
            { 1: previousElements } = previousSources
      
      if (!currentElements.length) return // Conditionally removed

      if (status.order === 'changed') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          const index = findIndex<HTMLElement>(element => element === previousElements[pick])(currentElements) as number
        
          if (typeof index === 'number') indices.push(index)

          return indices
        }, [])(pickable.picks)

        exact(indices, { replace: 'all' })

        return
      }

      if (status.length === 'shortened') {
        // Conditional rendering empties array
        if (currentElements.length === 0) return

        const indices = createReduce<number, number[]>((indices, pick) => {
          if (pick <= currentElements.length - 1) indices.push(pick)
          return indices
        }, [])(pickable.picks)

        if (indices.length === 0) {
          pickable.omit()
          return
        }

        exact(indices, { replace: 'all' })

        return
      }

      const indices = createReduce<number, number[]>((indices, pick) => {
        if (!currentMeta.length || currentMeta[pick].ability === 'enabled') indices.push(pick)
        return indices
      }, [])(pickable.picks)
      
      const abilityStatus = indices.length === pickable.picks.length
        ? 'none'
        : 'changed'

      if (abilityStatus === 'changed') {
        if (indices.length === 0) {
          pickable.omit()
          return
        }

        exact(indices, { replace: 'all' })
      }
    },
    { flush: 'post' }
  )

  return {
    exact,
    next,
    previous,
    all,
  }
}
