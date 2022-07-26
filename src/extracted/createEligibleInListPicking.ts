import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { createReduce, Pickable } from '@baleada/logic'
import type { IdentifiedListApi } from './useElementApi'
import { ensureWatchSources } from './ensureWatchSources'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
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
export function createEligibleInListPicking (
  { pickable, ability, list }: {
    pickable: Ref<Pickable<HTMLElement>>,
    ability: StatusOption<Ref<HTMLElement[]>, 'enabled' | 'disabled'>,
    list: IdentifiedListApi<HTMLElement>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  next: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previous: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const getAbility = ensureGetStatus(list.elements, ability),
        exact: ReturnType<typeof createEligibleInListPicking>['exact'] = (indexOrIndices, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'disabled')
            || (isRef(ability) && ability.value === 'disabled')
          ) {
            return 'none'
          }

          if (
            (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const eligible = new Pickable(pickable.value.array)
              .pick(indexOrIndices)
              .picks
              .filter(index => toEligibility(index) === 'eligible')
            
            pickable.value.pick(eligible, pickOptions)
            return 'enabled'
          }

          const eligible = new Pickable(pickable.value.array)
            .pick(indexOrIndices)
            .picks
            .filter(index =>
              getAbility(index) === 'enabled'
              && toEligibility(index) === 'eligible'
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

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextEligible = toNextEligible(index, toEligibility)
            
            if (typeof nextEligible === 'number') {
              pickable.value.pick(nextEligible, pickOptions)
              return 'enabled'
            }
  
            return 'none'
          }

          const nextEligible = toNextEligible(
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

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousEligible = toPreviousEligible(index, toEligibility)
            
            if (typeof previousEligible === 'number') {
              pickable.value.pick(previousEligible, pickOptions)
              return 'enabled'
            }
  
            return 'none'
          }

          const previousEligible = toPreviousEligible(
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
        toPreviousEligible = createToPreviousEligible({ list, loops: false })

  if (isRef(ability)) {
    watch(
      ability,
      () => {
        if (ability.value === 'disabled') {
          pickable.value.omit()
        }
      }
    )
  } else if (typeof ability !== 'string' && typeof ability !== 'function') {
    watch(
      ensureWatchSources(ability.watchSource),
      () => {
        const p = new Pickable(pickable.value.array).pick(pickable.value.picks)

        p.array.forEach((_, index) => {
          if (ability.get(index) === 'disabled') {
            p.omit(index)
          }
        })

        pickable.value.pick(p.picks, { replace: 'all' })
      }
    )
  }

  watch(
    [list.status, list.elements],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources,
            { 1: previousElements } = previousSources

      if (status.order === 'changed') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          const index = findIndex<HTMLElement>(element => element.isSameNode(previousElements[pick]))(currentElements) as number
        
          if (typeof index === 'number') {
            indices.push(index)
          }

          return indices
        }, [])(pickable.value.picks)

        exact(indices, { replace: 'all' })

        return
      }

      if (status.length === 'shortened') {
        // Conditional rendering empties array
        if (currentElements.length === 0) return

        const indices = createReduce<number, number[]>((indices, pick) => {
          if (pick <= currentElements.length - 1) {
            indices.push(pick)
          }

          return indices
        }, [])(pickable.value.picks)

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
  }
}
