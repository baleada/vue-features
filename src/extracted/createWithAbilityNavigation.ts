import type { Ref } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterObject } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'

/**
 * Shared logic for any interface that supports keyboard navigation for a list of elements, some of which may be statically or reactively disabled.
 */
export function createWithAbilityNavigation (
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
    elementIsEnabled:  BindValue<'enabled' | 'disabled'> | BindValueGetterObject<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    ensuredGetAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  navigate: (index: number) => void,
  next: (index: number) => void,
  previous: (index: number) => void,
  first: () => void,
  last: () => void,
  random: () => void,
} {
  const navigate: ReturnType<typeof createWithAbilityNavigation>['navigate'] = index => {
          if (disabledElementsReceiveFocus) {
            withAbility.value.navigate(index)
            return
          }

          if (ensuredGetAbility(index) === 'enabled') {
            withAbility.value.navigate(index)
          }
        },
        first: ReturnType<typeof createWithAbilityNavigation>['first'] = () => {
          const n = new Navigateable(withAbility.value.array)
          navigate(n.first().location)
        },
        last: ReturnType<typeof createWithAbilityNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          navigate(n.last().location)
        },
        random: ReturnType<typeof createWithAbilityNavigation>['last'] = () => {
          const n = new Navigateable(withAbility.value.array)
          navigate(n.random().location)
        },
        next: ReturnType<typeof createWithAbilityNavigation>['next'] = index => {
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
                  let nextEnabled
                  while (nextEnabled === undefined && n.location !== limit) {
                    n.next({ loops })
                
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
        previous: ReturnType<typeof createWithAbilityNavigation>['previous'] = index => {
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
                  let previousEnabled
                  while (previousEnabled === undefined && n.location !== limit) {
                    n.previous({ loops })
                
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
    navigate,
    next,
    previous,
    first,
    last,
    random
  }
}
