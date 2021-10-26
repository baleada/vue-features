import { isRef } from 'vue'
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
    ability,
    elementsApi,
    getAbility,
  }: {
    disabledElementsReceiveFocus: boolean,
    withAbility: Ref<Navigateable<HTMLElement>>,
    loops: boolean,
    ability:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
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

          if (getAbility(index) === 'enabled') {
            withAbility.value.navigate(index)
          }
        },
        first: ReturnType<typeof createEnabledNavigation>['first'] = () => {
          // TODO: focus first enabled? Or just try first, and fail silently?
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
          if (!loops && index === withAbility.value.array.length - 1) {
            return
          }
          
          if (disabledElementsReceiveFocus) {
            withAbility.value.next({ loops })
            return
          }
        
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.next({ loops })
            }
        
            return
          }
          
          if (isRef(ability)) {
            if (ability.value === 'enabled') {
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
                
                    if (getAbility(n.location) === 'enabled') {
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
          if (!loops && index === 0) {
            return
          }

          if (disabledElementsReceiveFocus) {
            withAbility.value.previous({ loops })
            return
          }
        
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.previous({ loops })
            }
        
            return
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
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
                
                    if (getAbility(n.location) === 'enabled') {
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
