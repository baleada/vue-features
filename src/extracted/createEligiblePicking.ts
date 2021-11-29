import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { createReduce, Navigateable, Pickable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'
import { ensureWatchSources } from './ensureWatchSources'
import { createToNextEligible, createToPreviousEligible } from './createToEligible'
import type { ToEligibility } from './createToEligible'

type BaseEligiblePickingOptions = { toEligibility?: ToEligibility }

const defaultEligiblePickingOptions: BaseEligiblePickingOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements that are considered possible picks, and updating picks if element ability changes. Methods return the ability of the item, if any, that they pick.
 */
export function createEligiblePicking (
  {
    pickable,
    ability,
    elementsApi,
    getAbility,
  }: {
    pickable: Ref<Pickable<HTMLElement>>,
    ability:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  next: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previous: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const exact: ReturnType<typeof createEligiblePicking>['exact'] = (indexOrIndices, options = {}) => {
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              pickable.value.pick(indexOrIndices, options)
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              pickable.value.pick(indexOrIndices, options)
              return 'enabled'
            }
        
            return 'none'
          }

          const enabled = new Pickable(pickable.value.array)
            .pick(indexOrIndices)
            .picks
            .filter(index => getAbility(index) === 'enabled')

          if (enabled.length > 0) {
            pickable.value.pick(enabled, options)
            return 'enabled'
          }

          return 'none'
        },
        next: ReturnType<typeof createEligiblePicking>['next'] = (index, options = {}) => {
          if (index === pickable.value.array.length - 1) {
            return 'none'
          }

          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              pickable.value.pick(index + 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              pickable.value.pick(index + 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          const limit = elementsApi.elements.value.length - 1,
                n = new Navigateable(pickable.value.array).navigate(index),
                nextEnabled = (() => {
                  let nextEnabled, didReachLimit = false
                  while (nextEnabled === undefined && !didReachLimit) {
                    n.next({ loops: false })
                    didReachLimit = n.location === limit
                
                    if (getAbility(n.location) === 'enabled') {
                      nextEnabled = n.location
                    }
                  }

                  return nextEnabled
                })()
        
          if (typeof nextEnabled === 'number') {
            pickable.value.pick(nextEnabled, options)
            return 'enabled'
          }

          return 'none'
        },
        previous: ReturnType<typeof createEligiblePicking>['next'] = (index, options = {}) => {          
          if (index === 0) {
            return 'none'
          }

          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              pickable.value.pick(index - 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              pickable.value.pick(index - 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          const limit = 0,
                n = new Navigateable(pickable.value.array).navigate(index),
                previousEnabled = (() => {
                  let previousEnabled, didReachLimit = false
                  while (previousEnabled === undefined && !didReachLimit) {
                    n.previous({ loops: false })
                    didReachLimit = n.location === limit
                
                    if (getAbility(n.location) === 'enabled') {
                      previousEnabled = n.location
                    }
                  }

                  return previousEnabled
                })()
        
          if (typeof previousEnabled === 'number') {
            pickable.value.pick(previousEnabled, options)
            return 'enabled'
          }

          return 'none'
        }

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
      ensureWatchSources(ability.watchSources),
      () => {
        const p = new Pickable(pickable.value.array).pick(pickable.value.picks)

        p.array.forEach((_, index) => {
          if (ability.get({ element: elementsApi.elements.value[index], index }) === 'disabled') {
            p.omit(index)
          }
        })

        pickable.value.pick(p.picks, { replace: 'all' })
      }
    )
  }

  watch(
    [elementsApi.status, elementsApi.elements],
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
      }

      if (status.length === 'shortened') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          if (pick <= currentElements.length - 1) {
            indices.push(pick)
          }

          return indices
        }, [])(pickable.value.picks)

        exact(indices, { replace: 'all' })
      }
    }
  )

  return {
    exact,
    next,
    previous,
  }
}
