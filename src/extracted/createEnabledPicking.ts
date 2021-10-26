import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { Navigateable, Pickable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'
import { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'

/**
 * Creates methods for picking only the enabled elements in a list, and updating picks if element ability changes.
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
  exact: (indexOrIndices: number | number[], options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => void,
  next: (index: number, options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => void,
  previous: (index: number, options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => void,
} {
  const exact: ReturnType<typeof createEnabledPicking>['exact'] = (indexOrIndices, options) => {
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.pick(indexOrIndices, options)
            }
        
            return
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.pick(indexOrIndices, options)
            }
        
            return
          }

          const enabled = new Pickable(withAbility.value.array)
            .pick(indexOrIndices)
            .picks
            .filter(index => getAbility(index) === 'enabled')

          withAbility.value.pick(enabled, options)
        },
        next: ReturnType<typeof createEnabledPicking>['next'] = (index, options) => {
          if (index === withAbility.value.array.length - 1) {
            return
          }

          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.pick(index + 1, options)
            }
        
            return
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.pick(index + 1, options)
            }
        
            return
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
          }
        },
        previous: ReturnType<typeof createEnabledPicking>['next'] = (index, options) => {          
          if (index === 0) {
            return
          }

          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.pick(index - 1, options)
            }
        
            return
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.pick(index - 1, options)
            }
        
            return
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
          }
        }

  // TODO: adjust picks after reorder or delete

  return {
    exact,
    next,
    previous,
  }
}
