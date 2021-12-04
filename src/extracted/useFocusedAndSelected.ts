import { onMounted, watch, watchPostEffect } from 'vue'
import type { Ref } from 'vue'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind, on } from '../affordances'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { createEligibleNavigation } from './createEligibleNavigation'
import { createEligiblePicking } from './createEligiblePicking'
import { ensureGetStatus } from './ensureGetStatus'
import { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'

export type FocusedAndSelected<Multiselectable extends boolean = false> = Multiselectable extends true
  ? FocusedAndSelectedBase & {
    select: ReturnType<typeof createEligiblePicking>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : FocusedAndSelectedBase & {
    select: Omit<ReturnType<typeof createEligiblePicking>, 'exact'> & { exact: (index: number) => void },
    deselect: (index: number) => void,
  }

type FocusedAndSelectedBase = {
  focused: Ref<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createEligibleNavigation>,
  selected: Ref<Pickable<HTMLElement>>,
  is: {
    focused: (index: number) => boolean,
    selected: (index: number) => boolean,
  }
  getStatuses: (index: number) => ['focused' | 'blurred', 'selected' | 'deselected', 'enabled' | 'disabled'],
}

export type UseFocusedAndSelectedConfig<Multiselectable extends boolean = false> = Multiselectable extends true
  ? UseFocusedAndSelectedConfigBase<Multiselectable> & {
    initialSelected?: number | number[],
  }
  : UseFocusedAndSelectedConfigBase<Multiselectable> & {
    initialSelected?: number,
  }

type UseFocusedAndSelectedConfigBase<Multiselectable extends boolean> = {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  ability: BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
  orientation: 'horizontal' | 'vertical',
  multiselectable: Multiselectable,
  selectsOnFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
}

export function useFocusedAndSelected<Multiselectable extends boolean = false> (
  {
    elementsApi,
    ability,
    initialSelected,
    orientation,
    multiselectable,
    selectsOnFocus,
    disabledElementsReceiveFocus,
    loops,
  }: UseFocusedAndSelectedConfig<Multiselectable>
) {
  // ABILITY
  const getAbility = ensureGetStatus({ element: elementsApi.elements, status: ability })

  bind({
    element: elementsApi.elements,
    values: {
      ariaDisabled: {
        get: ({ index }) => getAbility(index) === 'disabled' ? true : undefined,
        watchSources: ensureWatchSourcesFromStatus(ability),
      },
    },
  })


  // FOCUSED
  const focused: FocusedAndSelected<true>['focused'] = useNavigateable(elementsApi.elements.value),
        focus: FocusedAndSelected<true>['focus'] = createEligibleNavigation({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          ability,
          elementsApi,
        }),
        isFocused: FocusedAndSelected<true>['is']['focused'] = index => focused.value.location === index

  onMounted(() => {
    watchPostEffect(() => focused.value.array = elementsApi.elements.value)
    focused.value.navigate(selected.value.newest)

    watch(
      () => focused.value.location,
      () => {
        if (elementsApi.elements.value[focused.value.location].isSameNode(document.activeElement)) {
          return
        }
        
        elementsApi.elements.value[focused.value.location].focus()
      },
      { flush: 'post' }
    )
  })


  // SELECTED
  const selected: FocusedAndSelected<true>['selected'] = usePickable(elementsApi.elements.value),
        select: FocusedAndSelected<true>['select'] = createEligiblePicking({
          pickable: selected,
          ability,
          elementsApi,
        }),
        deselect: FocusedAndSelected<true>['deselect'] = indexOrIndices => {
          selected.value.omit(indexOrIndices)
        },
        isSelected: FocusedAndSelected<true>['is']['selected'] = index => selected.value.picks.includes(index)

  onMounted(() => {
    watchPostEffect(() => selected.value.array = elementsApi.elements.value)
    selected.value.pick(initialSelected)
  })

  bind({
    element: elementsApi.elements,
    values: {
      ariaSelected: {
        get: ({ index }) => index === selected.value.newest ? 'true' : undefined,
        watchSources: selected,
      },
      tabindex: {
        get: api => {
          const getElementIndex = () => api.index === selected.value.newest ? 0 : -1

          if (disabledElementsReceiveFocus) {
            return getElementIndex()
          }

          if (getAbility(api.index) === 'enabled') {
            return getElementIndex()
          }
        },
        watchSources: [
          selected,
          ...ensureWatchSourcesFromStatus(ability),
        ],
      },
    }
  })


  // MULTIPLE CONCERNS
  const getStatuses: FocusedAndSelected<true>['getStatuses'] = index => {
    return [
      isFocused(index) ? 'focused' : 'blurred',
      isSelected(index) ? 'selected' : 'deselected',
      getAbility(index),
    ]
  }

  on<
    '+right'
    | '+left'
    | 'ctrl+left'
    | 'cmd+left'
    | 'ctrl+right'
    | 'cmd+right'
    | '+down'
    | '+up'
    | 'ctrl+up'
    | 'cmd+up'
    | 'ctrl+down'
    | 'cmd+down'
    | '+home'
    | '+end'
    | 'cmd+a'
    | 'ctrl+a'
    | '+space'
    | '+enter'
    | 'mousedown'
    | 'touchstart'
  >({
    element: elementsApi.elements,
    effects: defineEffect => [
      defineEffect(
        orientation === 'horizontal' ? 'right' as '+right' : 'down' as '+down',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()

            focus.next(index)

            const ability = focus.next(index)

            if (selectsOnFocus) {
              selectOnFocus(ability)
            }
          }
        }
      ),
      defineEffect(
        orientation === 'horizontal' ? 'left' as '+left' : 'up' as '+up',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
            
            const ability = focus.previous(index)

            if (selectsOnFocus) {
              selectOnFocus(ability)
            }
          }
        }
      ),
      ...([
        'home' as '+home',
        orientation === 'horizontal' ? 'ctrl+left' : 'ctrl+up',
        orientation === 'horizontal' ? 'cmd+left' : 'cmd+up',
      ] as 'cmd+left'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          
          const ability = focus.first()

          if (selectsOnFocus) {
            selectOnFocus(ability)
          }
        }
      )),
      ...([
        'end' as '+end',
        orientation === 'horizontal' ? 'ctrl+right' : 'ctrl+down',
        orientation === 'horizontal' ? 'cmd+right' : 'cmd+down',
      ] as 'cmd+right'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          
          const ability = focus.last()

          if (selectsOnFocus) {
            selectOnFocus(ability)
          }
        }
      )),
      ...(() => {
        if (selectsOnFocus) return []

        return [
          ...(['space' as '+space', 'enter' as '+enter'] as '+space'[]).map(name => defineEffect(
            name,
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()

                if (isSelected(index)) {
                  deselect(index)
                  return
                }
                
                select.exact(index, { replace: multiselectable ? 'all' : 'none' })
              }
            }
          )),
          ...(['mousedown', 'touchstart'] as 'mousedown'[]).map(name => defineEffect(
            name,
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()
      
                focus.exact(index)
                select.exact(index, { replace: 'all' })
                
                if (isSelected(index)) {
                  deselect(index)
                  return
                }
      
                select.exact(index, { replace: multiselectable ? 'none' : 'all' })
              }
            }
          )),
        ]
      })(),
      ...(['ctrl+a', 'cmd+a'] as 'cmd+a'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()

          // active
          selected.value.pick(focused.value.location, { replace: 'all' })
          
          const ability = focus.last()

          if (selectsOnFocus) {
            selectOnFocus(ability)
          }
        }
      )),
    ],
  })

  const selectOnFocus = (ability: 'enabled' | 'disabled' | 'none') => {
    switch (ability) {
      case 'enabled':
        selected.value.pick(focused.value.location, { replace: 'all' })
        break
      case 'disabled':
        selected.value.omit()
        break
      case 'none':
        // do nothing
    }
  }

  return {
    focused,
    focus,
    selected,
    select,
    is: {
      focused: index => isFocused(index),
      selected: index => isSelected(index),
    },
    getStatuses,
  } as unknown as FocusedAndSelected<Multiselectable>
}
