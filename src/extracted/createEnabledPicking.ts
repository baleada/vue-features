import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { createReduce, Navigateable, Pickable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'
import { ensureWatchSources } from './ensureWatchSources'

/**
 * Creates methods for picking only the enabled elements in a list, and updating picks if element ability changes. Methods return the ability of the item, if any, that they pick.
 */
export function createEnabledPicking (
  {
    withAbility,
    ability,
    elementsApi,
    getAbility,
  }: {
    withAbility: Ref<Pickable<HTMLElement>>,
    ability:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  next: (index: number, options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previous: (index: number, options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const exact: ReturnType<typeof createEnabledPicking>['exact'] = (indexOrIndices, options) => {
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.pick(indexOrIndices, options)
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.pick(indexOrIndices, options)
              return 'enabled'
            }
        
            return 'none'
          }

          const enabled = new Pickable(withAbility.value.array)
            .pick(indexOrIndices)
            .picks
            .filter(index => getAbility(index) === 'enabled')

          if (enabled.length > 0) {
            withAbility.value.pick(enabled, options)
            return 'enabled'
          }

          return 'none'
        },
        next: ReturnType<typeof createEnabledPicking>['next'] = (index, options) => {
          if (index === withAbility.value.array.length - 1) {
            return 'none'
          }

          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.pick(index + 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.pick(index + 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          const limit = elementsApi.elements.value.length - 1,
                n = new Navigateable(withAbility.value.array).navigate(index),
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
            withAbility.value.pick(nextEnabled, options)
            return 'enabled'
          }

          return 'none'
        },
        previous: ReturnType<typeof createEnabledPicking>['next'] = (index, options) => {          
          if (index === 0) {
            return 'none'
          }

          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.pick(index - 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.pick(index - 1, options)
              return 'enabled'
            }
        
            return 'none'
          }

          const limit = 0,
                n = new Navigateable(withAbility.value.array).navigate(index),
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
            withAbility.value.pick(previousEnabled, options)
            return 'enabled'
          }

          return 'none'
        }

  if (isRef(ability)) {
    watch(
      ability,
      () => {
        if (ability.value === 'disabled') {
          withAbility.value.omit()
        }
      }
    )
  } else if (typeof ability !== 'string' && typeof ability !== 'function') {
    watch(
      ensureWatchSources(ability.watchSources),
      () => {
        const p = new Pickable(withAbility.value.array).pick(withAbility.value.picks)

        p.array.forEach((_, index) => {
          if (ability.get({ element: elementsApi.elements.value[index], index }) === 'disabled') {
            p.omit(index)
          }
        })

        withAbility.value.pick(p.picks, { replace: 'all' })
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
        }, [])(withAbility.value.picks)

        exact(indices, { replace: 'all' })
      }

      if (status.length === 'shortened') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          if (pick <= currentElements.length - 1) {
            indices.push(pick)
          }

          return indices
        }, [])(withAbility.value.picks)

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
