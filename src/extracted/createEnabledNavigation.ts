import { isRef } from 'vue'
import type { Ref } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'

/**
 * Creates methods for navigating only the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
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
  exact: (index: number) => 'enabled' | 'disabled' | 'none',
  next: (index: number) => 'enabled' | 'disabled' | 'none',
  previous: (index: number) => 'enabled' | 'disabled' | 'none',
  first: () => 'enabled' | 'disabled' | 'none',
  last: () => 'enabled' | 'disabled' | 'none',
  random: () => 'enabled' | 'disabled' | 'none',
} {
  const exact: ReturnType<typeof createEnabledNavigation>['exact'] = index => {
          if (disabledElementsReceiveFocus) {
            withAbility.value.navigate(index)
            return getAbility(index)
          }

          const a = getAbility(index)

          if (a === 'enabled') {
            withAbility.value.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createEnabledNavigation>['first'] = () => {
          const n = new Navigateable(withAbility.value.array)
          return exact(n.first().location)
        },
        last: ReturnType<typeof createEnabledNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          return exact(n.last().location)
        },
        random: ReturnType<typeof createEnabledNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          return exact(n.random().location)
        },
        next: ReturnType<typeof createEnabledNavigation>['next'] = index => {
          if (!loops && index === withAbility.value.array.length - 1) {
            return 'none'
          }
          
          if (disabledElementsReceiveFocus) {
            withAbility.value.next({ loops })
            return getAbility(withAbility.value.location)
          }
        
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.next({ loops })
              return 'enabled'
            }
        
            return 'none'
          }
          
          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.next({ loops })
              return 'enabled'
            }
        
            return 'none'
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
            return 'enabled'
          }

          return 'none'
        },
        previous: ReturnType<typeof createEnabledNavigation>['previous'] = index => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (disabledElementsReceiveFocus) {
            withAbility.value.previous({ loops })
            return getAbility(withAbility.value.location)
          }
        
          if (typeof ability === 'string') {
            if (ability === 'enabled') {
              withAbility.value.previous({ loops })
              return 'enabled'
            }
        
            return 'none'
          }

          if (isRef(ability)) {
            if (ability.value === 'enabled') {
              withAbility.value.previous({ loops })
              return 'enabled'
            }
        
            return 'none'
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
            return 'enabled'
          }

          return 'none'
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
