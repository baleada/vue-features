import type { Ref } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'

/**
 * Creates methods for navigating only the enabled elements in a list.
 */
export function createEnabledNavigation (
  {
    disabledElementsReceiveFocus,
    withAbility,
    loops,
    elementIsEnabled,
    elementsApi,
    ensuredGetAbility,
  }: {
    disabledElementsReceiveFocus: boolean,
    withAbility: Ref<Navigateable<HTMLElement>>,
    loops: boolean,
    elementIsEnabled:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    ensuredGetAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (index: number) => void,
  next: (index: number) => void,
  previous: (index: number) => void,
  first: () => void,
  last: () => void,
  random: () => void,
} {
  const exact: ReturnType<typeof createEnabledNavigation>['exact'] = index => {
          if (disabledElementsReceiveFocus) {
            withAbility.value.navigate(index)
            return
          }

          if (ensuredGetAbility(index) === 'enabled') {
            withAbility.value.navigate(index)
          }
        },
        first: ReturnType<typeof createEnabledNavigation>['first'] = () => {
          const n = new Navigateable(withAbility.value.array)
          exact(n.first().location)
        },
        last: ReturnType<typeof createEnabledNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          exact(n.last().location)
        },
        random: ReturnType<typeof createEnabledNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          exact(n.random().location)
        },
        next: ReturnType<typeof createEnabledNavigation>['next'] = index => {
          if (disabledElementsReceiveFocus) {
            withAbility.value.next({ loops })
            return
          }
        
          if (typeof elementIsEnabled === 'string') {
            if (elementIsEnabled === 'enabled') {
              withAbility.value.next({ loops })
            }
        
            return
          }
          
          const limit = (() => {
                  if (loops) {
                    return index === 0 ? elementsApi.elements.value.length - 1 : index - 1
                  }
        
                  return elementsApi.elements.value.length - 1
                })(),
                n = new Navigateable(withAbility.value.array).navigate(index),
                nextEnabled = (() => {
                  let nextEnabled, didReachLimit = false
                  while (nextEnabled === undefined && !didReachLimit) {
                    n.next({ loops })
                    didReachLimit = n.location === limit
                
                    if (ensuredGetAbility(n.location) === 'enabled') {
                      nextEnabled = n.location
                    }
                  }

                  return nextEnabled
                })()
        
          if (typeof nextEnabled === 'number') {
            withAbility.value.navigate(nextEnabled)
          }
        },
        previous: ReturnType<typeof createEnabledNavigation>['previous'] = index => {
          if (disabledElementsReceiveFocus) {
            withAbility.value.previous({ loops })
            return
          }
        
          if (typeof elementIsEnabled === 'string') {
            if (elementIsEnabled === 'enabled') {
              withAbility.value.previous({ loops })
            }
        
            return
          }
          
          const limit = (() => {
                  if (loops) {
                    return index === elementsApi.elements.value.length - 1 ? 0 : index + 1
                  }
        
                  return 0
                })(),
                n = new Navigateable(withAbility.value.array).navigate(index),
                previousEnabled = (() => {
                  let previousEnabled, didReachLimit = false
                  while (previousEnabled === undefined && !didReachLimit) {
                    n.previous({ loops })
                    didReachLimit = n.location === limit
                
                    if (ensuredGetAbility(n.location) === 'enabled') {
                      previousEnabled = n.location
                    }
                  }

                  return previousEnabled
                })()
        
          if (typeof previousEnabled === 'number') {
            withAbility.value.navigate(previousEnabled)
          }
        }

  return {
    exact,
    next,
    previous,
    first,
    last,
    random
  }
}
