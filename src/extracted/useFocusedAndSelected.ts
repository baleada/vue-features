import { onMounted, watch, watchPostEffect, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import type { Navigateable, Pickable } from '@baleada/logic'
import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { bind, on } from '../affordances'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { createEligibleNavigation } from './createEligibleNavigation'
import { createEligiblePicking } from './createEligiblePicking'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'

export type FocusedAndSelected<Multiselectable extends boolean = false> = Multiselectable extends true
  ? FocusedAndSelectedBase & {
    select: ReturnType<typeof createEligiblePicking>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : FocusedAndSelectedBase & {
    select: Omit<ReturnType<typeof createEligiblePicking>, 'exact'> & { exact: (index: number) => void },
    deselect: () => void,
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
    initialSelected?: number | number[] | 'none',
  }
  : UseFocusedAndSelectedConfigBase<Multiselectable> & {
    initialSelected?: number | 'none',
  }

type UseFocusedAndSelectedConfigBase<Multiselectable extends boolean = false> = {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  ability: StatusOption<'enabled' | 'disabled'>,
  orientation: 'horizontal' | 'vertical',
  multiselectable: Multiselectable,
  clearable: boolean,
  selectsOnFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function useFocusedAndSelected<Multiselectable extends boolean = false> (
  {
    elementsApi,
    ability,
    initialSelected,
    orientation,
    multiselectable,
    clearable,
    selectsOnFocus,
    disabledElementsReceiveFocus,
    loops,
    query,
  }: UseFocusedAndSelectedConfig<Multiselectable>
) {
  // ABILITY
  const getAbility = ensureGetStatus({ element: elementsApi.elements, status: ability })

  bind({
    element: elementsApi.elements,
    values: {
      ariaDisabled: {
        get: ({ index }) => getAbility(index) === 'disabled' ? true : undefined,
        watchSource: ensureWatchSourcesFromStatus(ability),
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

    const initialFocused = (() => {
      if (Array.isArray(initialSelected)) {
        if (initialSelected.length > 0) {
          return initialSelected[initialSelected.length - 1]
        }

        return 0
      }

      if (typeof initialSelected === 'number') {
        return initialSelected
      }

      return 0
    })()
    
    focused.value.navigate(initialFocused)

    watch(
      () => focused.value.location,
      () => {
        if (elementsApi.elements.value[focused.value.location]?.isSameNode(document.activeElement)) {
          return
        }
        
        elementsApi.elements.value[focused.value.location]?.focus()
      },
      { flush: 'post' }
    )
  })

  bind({
    element: elementsApi.elements,
    values: {
      tabindex: {
        get: ({ index }) => index === focused.value.location ? 0 : -1,
        watchSource: () => focused.value.location,
      },
    }
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

  if (selectsOnFocus) {
    watch(
      () => focused.value.location,
      () => select.exact(focused.value.location, { replace: 'all' })
    )
  }

  onMounted(() => {
    watchPostEffect(() => selected.value.array = elementsApi.elements.value)
    selected.value.pick(initialSelected === 'none' ? [] : initialSelected)
  })

  bind({
    element: elementsApi.elements,
    values: {
      ariaSelected: {
        get: ({ index }) => isSelected(index) ? 'true' : undefined,
        watchSource: () => selected.value.picks,
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
    '!shift+!cmd+!ctrl+right'
    | '!cmd+!ctrl+right'
    | '!shift+!cmd+!ctrl+left'
    | '!cmd+!ctrl+left'
    | '!shift+ctrl+left'
    | 'ctrl+left'
    | '!shift+cmd+left'
    | 'cmd+left'
    | '!shift+ctrl+right'
    | 'ctrl+right'
    | '!shift+cmd+right'
    | 'cmd+right'
    | '!shift+!cmd+!ctrl+down'
    | '!cmd+!ctrl+down'
    | '!shift+!cmd+!ctrl+up'
    | '!cmd+!ctrl+up'
    | '!shift+ctrl+up'
    | 'ctrl+up'
    | '!shift+cmd+up'
    | 'cmd+up'
    | '!shift+ctrl+down'
    | 'ctrl+down'
    | '!shift+cmd+down'
    | 'cmd+down'
    | '+home'
    | '+end'
    | '+space'
    | '+enter'
    | 'mousedown'
    | TouchesTypes
    | '+esc',
    TouchesMetadata
  >({
    element: elementsApi.elements,
    effects: defineEffect => [
      defineEffect(
        orientation === 'horizontal'
          ? multiselectable ? '!shift+!cmd+!ctrl+right' : '!cmd+!ctrl+right'
          : multiselectable ? '!shift+!cmd+!ctrl+down' : '!cmd+!ctrl+down',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()

            const a = focus.next(index)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      defineEffect(
        orientation === 'horizontal'
          ? multiselectable ? '!shift+!cmd+!ctrl+left' : '!cmd+!ctrl+left'
          : multiselectable ? '!shift+!cmd+!ctrl+up' : '!cmd+!ctrl+up',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
            
            const a = focus.previous(index)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      ...([
        'home' as '+home',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+ctrl+left' : 'ctrl+left'
          : multiselectable ? '!shift+ctrl+up' : 'ctrl+up',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+cmd+left' : 'cmd+left'
          : multiselectable ? '!shift+cmd+up' : 'cmd+up',
      ] as '!shift+cmd+left'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          
          const a = focus.first()

          if (selectsOnFocus) {
            selectOnFocus(a)
          }
        }
      )),
      ...([
        'end' as '+end',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+ctrl+right' : 'ctrl+right'
          : multiselectable ? '!shift+ctrl+down' : 'ctrl+down',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+cmd+right' : 'cmd+right'
          : multiselectable ? '!shift+cmd+down' : 'cmd+down',
      ] as '!shift+cmd+right'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          
          const a = focus.last()

          if (selectsOnFocus) {
            selectOnFocus(a)
          }
        }
      )),
      ...(() => {
        if (selectsOnFocus) return []

        return [
          defineEffect(
            'enter' as '+enter',
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()

                if (isSelected(index)) {
                  if (clearable || selected.value.picks.length > 1) {
                    deselect(index)
                  }
                  
                  return
                }
                
                select.exact(index, { replace: multiselectable ? 'none' : 'all' })
              }
            }
          ),
          defineEffect(
            'space' as '+space',
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()

                if (query?.value) return

                if (isSelected(index)) {
                  if (clearable || selected.value.picks.length > 1) {
                    deselect(index)
                  }
                  
                  return
                }
                
                select.exact(index, { replace: multiselectable ? 'none' : 'all' })
              }
            }
          ),
          defineEffect(
            'mousedown',
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()

                focus.exact(index)
                
                if (isSelected(index)) {
                  if (clearable || selected.value.picks.length > 1) {
                    deselect(index)
                  }
                  
                  return
                }
      
                select.exact(index, { replace: multiselectable ? 'none' : 'all' })
              },
            }
          ),
          defineEffect(
            'recognizeable' as TouchesTypes,
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()

                focus.exact(index)
                
                if (isSelected(index)) {
                  if (clearable || selected.value.picks.length > 1) {
                    deselect(index)
                  }
                  
                  return
                }
      
                select.exact(index, { replace: multiselectable ? 'none' : 'all' })
              },
              options: {
                listenable: {
                  recognizeable: {
                    effects: touches()
                  }
                },
              }
            }
          ),
        ]
      })(),
      ...(() =>
        clearable
          ? [defineEffect(
              'esc' as '+esc',
              event => {
                // Avoid unintended side effects, e.g. clearing selected and immediately
                // closing a dialog.
                event.preventDefault()
                selected.value.omit()
              }
            )]
          : []
      )()
    ],
  })

  if (multiselectable) {
    on<
      'shift+!cmd+!ctrl+right'
      | 'shift+!cmd+!ctrl+left'
      | 'shift+ctrl+left'
      | 'shift+cmd+left'
      | 'shift+ctrl+right'
      | 'shift+cmd+right'
      | 'shift+!cmd+!ctrl+down'
      | 'shift+!cmd+!ctrl+up'
      | 'shift+ctrl+up'
      | 'shift+cmd+up'
      | 'shift+ctrl+down'
      | 'shift+cmd+down'
      | 'cmd+a'
      | 'ctrl+a'
    >({
      element: elementsApi.elements,
      effects: defineEffect => [
        defineEffect(
          orientation === 'horizontal' ? 'shift+!cmd+!ctrl+right' : 'shift+!cmd+!ctrl+down',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              if (selected.value.multiple && index === selected.value.first) {
                selected.value.omit(index)
                focus.next(index)
                return
              }
              
              if (selected.value.multiple && index !== selected.value.last) {
                selected.value.omit()
              }

              select.exact(index)
              const a = select.next(index)

              if (a === 'enabled') {
                focused.value.navigate(selected.value.newest)
              }
            }
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+!cmd+!ctrl+left' : 'shift+!cmd+!ctrl+up',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              if (selected.value.multiple && index === selected.value.last) {
                selected.value.omit(index)
                focus.previous(index)
                return
              }
              
              if (selected.value.multiple && index !== selected.value.first) {
                selected.value.omit()
              }

              select.exact(index)
              const a = select.previous(index)

              if (a === 'enabled') {
                focused.value.navigate(selected.value.newest)
              }
            }
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+cmd+right' : 'shift+cmd+down',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              const picks: number[] = []
              for (let i = index; i < elementsApi.elements.value.length; i++) {
                if (getAbility(i) === 'enabled') {
                  picks.push(i)
                }
              }

              if (picks.length > 0) {
                focus.exact(picks[picks.length - 1])
                selected.value.pick(picks)
              } 
            }
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+cmd+left' : 'shift+cmd+up',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              const picks: number[] = []
              for (let i = 0; i < index + 1; i++) {
                if (getAbility(i) === 'enabled') {
                  picks.push(i)
                }
              }

              if (picks.length > 0) {
                focus.exact(picks[0])
                selected.value.pick(picks)
              } 
            }
          }
        ),
        ...(['ctrl+a', 'cmd+a'] as 'cmd+a'[]).map(name => defineEffect(
          name,
          event => {
            event.preventDefault()

            const picks: number[] = []
            for (let i = 0; i < elementsApi.elements.value.length; i++) {
              if (getAbility(i) === 'enabled') {
                picks.push(i)
              }
            }

            if (picks.length > 0) {
              focus.last()
              selected.value.pick(picks, { replace: 'all' })
            }
          }
        )),
      ]
    })
  }

  const selectOnFocus = (a: 'enabled' | 'disabled' | 'none') => {
    switch (a) {
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
