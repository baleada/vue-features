import { watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { createFilter, createReduce, Pickable } from '@baleada/logic'
import type { IdentifiedListApi } from './useElementApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInList'
import type { ToListEligibility } from './createToEligibleInList'

type BaseEligiblePickingOptions = { toEligibility?: ToListEligibility }

const defaultEligiblePickingOptions: BaseEligiblePickingOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInListPicking<Meta extends { ability: 'enabled' | 'disabled' }> (
  { pickable, list }: {
    pickable: Ref<Pickable<HTMLElement>>,
    list: IdentifiedListApi<HTMLElement, Meta>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  next: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previous: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  all: (options?: BaseEligiblePickingOptions) => 'enabled' | 'none',
} {
  const getAbility = (index: number) => list.meta.value[index]?.ability || 'enabled',
        exact: ReturnType<typeof createEligibleInListPicking>['exact'] = (indexOrIndices, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options },
                eligible = createFilter<number>(index =>
                  getAbility(index) === 'enabled'
                  && toEligibility(index) === 'eligible'
                )(
                  new Pickable(pickable.value.array)
                    .pick(indexOrIndices)
                    .picks
                )

          if (eligible.length > 0) {
            pickable.value.pick(eligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        next: ReturnType<typeof createEligibleInListPicking>['next'] = (index, options = {}) => {
          if (index === pickable.value.array.length - 1) {
            return 'none'
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options },
                nextEligible = toNextEligible(
                  index,
                  index => getAbility(index) === 'enabled'
                    ? toEligibility(index)
                    : 'ineligible',
                )
            
          if (typeof nextEligible === 'number') {
            pickable.value.pick(nextEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ list, loops: false }),
        previous: ReturnType<typeof createEligibleInListPicking>['next'] = (index, options = {}) => {          
          if (index === 0) {
            return 'none'
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options },
                previousEligible = toPreviousEligible(
                  index,
                  index => getAbility(index) === 'enabled'
                    ? toEligibility(index)
                    : 'ineligible',
                )
        
          if (typeof previousEligible === 'number') {
            pickable.value.pick(previousEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ list, loops: false }),
        all: ReturnType<typeof createEligibleInListPicking>['all'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligiblePickingOptions, ...options },
                newIndices: number[] = []
          
          for (let i = 0; i < pickable.value.array.length; i++) {
            if (getAbility(i) === 'enabled' && toEligibility(i) === 'eligible') {
              newIndices.push(i)
            }
          }

          if (newIndices.length > 0) {
            pickable.value.pick(newIndices)
            return 'enabled'
          }

          return 'none'
        }

  watch(
    [list.status, list.elements, list.meta],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements, 2: currentMeta } = currentSources,
            { 1: previousElements, 2: previousMeta } = previousSources
      
      if (!currentElements.length) return // Conditionally removed

      if (status.order === 'changed') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          const index = findIndex<HTMLElement>(element => element === previousElements[pick])(currentElements) as number
        
          if (typeof index === 'number') indices.push(index)

          return indices
        }, [])(pickable.value.picks)

        exact(indices, { replace: 'all' })

        return
      }

      if (status.length === 'shortened') {
        // Conditional rendering empties array
        if (currentElements.length === 0) return

        const indices = createReduce<number, number[]>((indices, pick) => {
          if (pick <= currentElements.length - 1) indices.push(pick)
          return indices
        }, [])(pickable.value.picks)

        if (indices.length === 0) {
          pickable.value.omit()
          return
        }

        exact(indices, { replace: 'all' })

        return
      }

      const indices = createReduce<number, number[]>((indices, pick) => {
        if (!currentMeta.length || currentMeta[pick].ability === 'enabled') indices.push(pick)
        return indices
      }, [])(pickable.value.picks)
      
      const abilityStatus = indices.length === pickable.value.picks.length
        ? 'none'
        : 'changed'

      if (abilityStatus === 'changed') {
        if (indices.length === 0) {
          pickable.value.omit()
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
