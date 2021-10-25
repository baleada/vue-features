import type { Ref } from 'vue'
import { Navigateable, Pickable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'

/**
 * Creates methods for picking only the enabled elements in a list.
 */
export function createEnabledPicking (
  {
    disabledElementsReceiveFocus,
    withAbility,
    elementIsEnabled,
    elementsApi,
    ensuredGetAbility,
  }: {
    disabledElementsReceiveFocus: boolean,
    withAbility: Ref<Pickable<HTMLElement>>,
    elementIsEnabled:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    ensuredGetAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => void,
  next: (index: number, options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => void,
  previous: (index: number, options?: Parameters<Pickable<HTMLElement>['pick']>[1]) => void,
} {
  const exact: ReturnType<typeof createEnabledPicking>['exact'] = (indexOrIndices, options) => {
          const enabled = new Pickable(withAbility.value.array)
            .pick(indexOrIndices)
            .picks
            .filter(index => ensuredGetAbility(index) === 'enabled')

          withAbility.value.pick(enabled, options)
        },
        next: ReturnType<typeof createEnabledPicking>['next'] = (index, options) => {          
          const limit = elementsApi.elements.value.length - 1,
                n = new Navigateable(withAbility.value.array).navigate(index),
                nextEnabled = (() => {
                  let nextEnabled, didReachLimit = false
                  while (nextEnabled === undefined && !didReachLimit) {
                    n.next({ loops: false })
                    didReachLimit = n.location === limit
                
                    if (ensuredGetAbility(n.location) === 'enabled') {
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
          const limit = 0,
                n = new Navigateable(withAbility.value.array).navigate(index),
                previousEnabled = (() => {
                  let previousEnabled, didReachLimit = false
                  while (previousEnabled === undefined && !didReachLimit) {
                    n.previous({ loops: false })
                    didReachLimit = n.location === limit
                
                    if (ensuredGetAbility(n.location) === 'enabled') {
                      previousEnabled = n.location
                    }
                  }

                  return previousEnabled
                })()
        
          if (typeof previousEnabled === 'number') {
            withAbility.value.pick(previousEnabled, options)
          }
        }

  return {
    exact,
    next,
    previous,
  }
}
