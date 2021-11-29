import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import type { GetStatus } from './ensureGetStatus'
import { createToNextPossible, createToPreviousPossible } from './createToPossible'
import type { ToPossibility } from './createToPossible'


/**
 * Creates methods for navigating only to elements that are considered possible locations, e.g. the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createPossibleNavigation (
  {
    disabledElementsArePossibleLocations,
    navigateable,
    loops,
    ability,
    elementsApi,
    getAbility,
  }: {
    disabledElementsArePossibleLocations: boolean,
    navigateable: Ref<Navigateable<HTMLElement>>,
    loops: boolean,
    ability:  BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
  }
): {
  exact: (index: number, options?: { toPossibility?: ToPossibility }) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: { toPossibility?: ToPossibility }) => 'enabled' | 'disabled' | 'none',
  previous: (index: number, options?: { toPossibility?: ToPossibility }) => 'enabled' | 'disabled' | 'none',
  first: (options?: { toPossibility?: ToPossibility }) => 'enabled' | 'disabled' | 'none',
  last: (options?: { toPossibility?: ToPossibility }) => 'enabled' | 'disabled' | 'none',
  random: (options?: { toPossibility?: ToPossibility }) => 'enabled' | 'disabled' | 'none',
} {
  const exact: ReturnType<typeof createPossibleNavigation>['exact'] = (index, options = { toPossibility: () => 'possible' }) => {
          const n = new Navigateable(elementsApi.elements.value).navigate(index),
                possibility = options.toPossibility({ index: n.location, element: elementsApi.elements.value[n.location] })

          if (disabledElementsArePossibleLocations && possibility === 'possible') {
            navigateable.value.navigate(index)
            return getAbility(index)
          }

          if (getAbility(index) === 'enabled' && possibility === 'possible') {
            navigateable.value.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createPossibleNavigation>['first'] = (options = { toPossibility: () => 'possible' }) => {
          return next(-1, { toPossibility: options.toPossibility })
        },
        last: ReturnType<typeof createPossibleNavigation>['last'] = (options = { toPossibility: () => 'possible' }) => {
          return previous(elementsApi.elements.value.length, { toPossibility: options.toPossibility })
        },
        random: ReturnType<typeof createPossibleNavigation>['last'] = (options = { toPossibility: () => 'possible' }) => {
          const n = new Navigateable(elementsApi.elements.value)

          if (options.toPossibility({ index: n.location, element: elementsApi.elements.value[n.location] }) === 'possible') {
            return exact(n.random().location)
          }

          return 'none'
        },
        next: ReturnType<typeof createPossibleNavigation>['next'] = (index, options = { toPossibility: () => 'possible' }) => {
          if (!loops && index === navigateable.value.array.length - 1) {
            return 'none'
          }
          
          if (
            disabledElementsArePossibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextPossible = toNextPossible({ index, toPossibility: options.toPossibility })
            
            if (typeof nextPossible === 'number') {
              navigateable.value.navigate(nextPossible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }

          const nextPossible = toNextPossible({
            index,
            toPossibility: ({ index, element }) => (getAbility(index) === 'enabled' && options.toPossibility({ index, element })) ? 'possible' : 'impossible',
          })
            
          if (typeof nextPossible === 'number') {
            navigateable.value.navigate(nextPossible)
            return 'enabled'
          }

          return 'none'
        },
        toNextPossible = createToNextPossible({ elementsApi, loops }),
        previous: ReturnType<typeof createPossibleNavigation>['previous'] = (index, options = { toPossibility: () => 'possible' }) => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (
            disabledElementsArePossibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousPossible = toPreviousPossible({ index, toPossibility: options.toPossibility })
            
            if (typeof previousPossible === 'number') {
              navigateable.value.navigate(previousPossible)
              return getAbility(navigateable.value.location)
            }
  
            return 'none'
          }
          
          const previousPossible = toPreviousPossible({
            index,
            toPossibility: ({ index, element }) => (getAbility(index) === 'enabled' && options.toPossibility({ index, element })) ? 'possible' : 'impossible',
          })
        
          if (typeof previousPossible === 'number') {
            navigateable.value.navigate(previousPossible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousPossible = createToPreviousPossible({ elementsApi, loops })

  watch(
    [elementsApi.status, elementsApi.elements],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources

      if (status.order === 'changed') {
        const { 1: previousElements } = previousSources,
              index = findIndex<HTMLElement>(element => element.isSameNode(previousElements[navigateable.value.location]))(currentElements) as number
        
        if (typeof index === 'number') {
          exact(index)
          return
        }
        
        first()
        return
      }

      if (status.length === 'shortened' && navigateable.value.location > currentElements.length - 1) {
        console.log(previous(navigateable.value.location))
        return
      }
    }
  )

  return {
    exact,
    next,
    previous,
    first,
    last,
    random
  }
}
