import { ref, computed, watch, watchPostEffect, onMounted, nextTick } from 'vue'
import type { ComputedRef, } from 'vue'
import { useNavigateable } from '@baleada/vue-composition'
import { Navigateable } from '@baleada/logic'
import type { ListenableKeycombo } from '@baleada/logic'
import { show, on, bind } from '../affordances'
import type { BindValueGetterWithWatchSources, TransitionOption } from '../affordances'
import {
  useElementApi,
  createEligibleNavigation,
  ensureGetStatus,
  ensureWatchSourcesFromStatus,
} from '../extracted'
import type {
  SingleElementApi,
  MultipleIdentifiedElementsApi,
  BindValue
} from '../extracted'

export type Tablist = {
  root: SingleElementApi<HTMLElement>,
  tabs: MultipleIdentifiedElementsApi<HTMLElement>,
  panels: MultipleIdentifiedElementsApi<HTMLElement>,
  focused: ComputedRef<number>,
  selected: ComputedRef<number>,
  is: {
    focused: (index: number) => boolean,
    selected: (index: number) => boolean,
  },
  getStatuses: (index: number) => ['enabled' | 'disabled', 'focused' | 'blurred', 'selected' | 'deselected'],
  focus: ReturnType<typeof createEligibleNavigation>,
  select: (index: number) => void,
}

export type UseTablistOptions = {
  initialSelected?: number,
  orientation?: 'horizontal' | 'vertical'
  selectsTabOnFocus?: boolean,
  openMenu?: ({ index }: { index: number }) => void,
  deleteTab?: ({ index, done }: { index: number, done: () => void }) => void,
  openMenuKeycombo?: ListenableKeycombo,
  deleteTabKeycombo?: ListenableKeycombo,
  transition?: { panel?: TransitionOption },
  loops?: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledTabsReceiveFocus?: boolean,
  ability?: BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
  panelContentsFocusability?: BindValue<'focusable' | 'not focusable'> | BindValueGetterWithWatchSources<'focusable' | 'not focusable'>,
}

const defaultOptions: UseTablistOptions = {
  initialSelected: 0,
  orientation: 'horizontal',
  selectsTabOnFocus: true,
  openMenuKeycombo: 'shift+f10',
  deleteTabKeycombo: 'delete' as '+delete',
  loops: true,
  disabledTabsReceiveFocus: true,
  ability: 'enabled',
  panelContentsFocusability: 'not focusable',
}

export function useTablist (options: UseTablistOptions = {}): Tablist {
  // OPTIONS
  const {
    initialSelected,
    orientation,
    selectsTabOnFocus,
    openMenuKeycombo,
    deleteTabKeycombo,
    openMenu,
    deleteTab,
    transition,
    loops,
    disabledTabsReceiveFocus,
    ability: abilityOption,
    panelContentsFocusability,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root: Tablist['root'] = useElementApi(),
        tabs: Tablist['tabs'] = useElementApi({ multiple: true, identified: true }),
        panels: Tablist['panels'] = useElementApi({ multiple: true, identified: true })


  // UTILS
  const getAbility = ensureGetStatus({ element: tabs.elements, status: abilityOption }),
        getPanelContentsFocusability = ensureGetStatus({ element: panels.elements, status: panelContentsFocusability })


  // FOCUSED
  const focused = useNavigateable(tabs.elements.value, { initialLocation: initialSelected }),
        focus = createEligibleNavigation({
          disabledElementsAreEligibleLocations: disabledTabsReceiveFocus,
          navigateable: focused,
          loops,
          ability: abilityOption,
          elementsApi: tabs,
        }),
        tabFocusUpdates = ref(0),
        forceTabFocusUpdate = () => tabFocusUpdates.value++

  onMounted(() => {
    watchPostEffect(() => focused.value.setArray(tabs.elements.value))

    watch(
      [
        () => focused.value.location,
        tabFocusUpdates,
      ],
      () => {
        if (tabs.elements.value[focused.value.location].isSameNode(document.activeElement)) {
          return
        }
        
        tabs.elements.value[focused.value.location].focus()
      },
      { flush: 'post' }
    )
  })

  on<'+right' | '+left' | '+down' | '+up' | '+home' | '+end'>({
    element: tabs.elements,
    effects: defineEffect => [
      ...(() => {
        switch (orientation) {
          case 'horizontal':
            return [
              defineEffect(
                'right' as '+right',
                {
                  createEffect: ({ index }) => event => {
                    event.preventDefault()
                    focus.next(index)
                  }
                }
              ),
              defineEffect(
                'left' as '+left',
                {
                  createEffect: ({ index }) => event => {
                    event.preventDefault()
                    focus.previous(index)
                  }
                }
              ),
            ]
          case 'vertical': 
            return [
              defineEffect(
                'down' as '+down',
                {
                  createEffect: ({ index }) => event => {
                    event.preventDefault()
                    focus.next(index)
                  }
                }
              ),
              defineEffect(
                'up' as '+up',
                {
                  createEffect: ({ index }) => event => {
                    event.preventDefault()
                    focus.previous(index)
                  }
                }
              ),
            ]
        }
      })(),
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          focus.first()
        }
      ),
      defineEffect(
        'end' as '+end',
        event => {
          event.preventDefault()
          focus.last()
        }
      ),
    ],
  })


  // SELECTED
  const selected = ref(focused.value.location),
        select: Tablist['select'] = index => {
          if (getAbility(index) === 'enabled') {
            if (focused.value.location !== index) {
              focused.value.navigate(index)
              if (selectsTabOnFocus) return
            }

            selected.value = index
          }
        }

  if (selectsTabOnFocus) {
    watch(
      () => focused.value.location,
      () => {
        if (selected.value === focused.value.location) {
          return
        }

        if (!disabledTabsReceiveFocus) {
          // Disabled tabs do not receive focus, therefore the focused tab is enabled
          // and we can skip the ability guard.
          selected.value = focused.value.location
          return
        }

        select(focused.value.location)
      }
    )
  }

  bind({
    element: tabs.elements,
    values: {
      ariaSelected: {
        get: ({ index }) => index === selected.value,
        watchSources: selected,
      },
      tabindex: {
        get: api => {
          const getTabindex = () => api.index === selected.value ? 0 : -1

          if (disabledTabsReceiveFocus) {
            return getTabindex()
          }

          if (getAbility(api.index) === 'enabled') {
            return getTabindex()
          }
        },
        watchSources: [
          selected,
          ...ensureWatchSourcesFromStatus(abilityOption),
        ],
      },
    }
  })

  show(
    {
      element: panels.elements,
      condition: {
        get: ({ index }) => index === selected.value,
        watchSources: selected,
      }
    },
    { transition: transition?.panel }
  )

  on<'mouseup' | 'touchend' | '+space' | '+enter'>({
    element: tabs.elements,
    effects: defineEffect => ['mouseup', 'touchend', 'space', 'enter'].map(name => defineEffect(
      name as 'mouseup',
      {
        createEffect: ({ index }) => event => {
          const ability = getAbility(index)

          if (disabledTabsReceiveFocus) {
            focused.value.navigate(index)
            if (ability === 'enabled' && !selectsTabOnFocus) {
              // Tab is not selected on focus, so we need to manually select it.
              //
              // Since the ability check has already been done, we can skip `select`
              // and assign to `selected` directly.
              selected.value = index
            }

            return
          }

          if (ability === 'enabled') {
            focused.value.navigate(index)
            if (!selectsTabOnFocus) {
              // Tab is not selected on focus, so we need to manually select it.
              //
              // Since the ability check has already been done, we can skip `select`
              // and assign to `selected` directly.
              selected.value = index
            }
          }
        }
      }
    ))
  })


  // MULTIPLE CONCERNS
  if (deleteTab) {
    on<ListenableKeycombo>({
      element: tabs.elements,
      effects: defineEffect => [
        defineEffect(
          deleteTabKeycombo,
          event => {
            event.preventDefault()
            
            const cached = focused.value.location,
                  done = () => nextTick(() => {
                    focused.value.navigate(cached)
                    forceTabFocusUpdate()
          
                    if (!selectsTabOnFocus && selected.value === cached) {
                      selected.value = focused.value.location
                    }
          
                    if (!selectsTabOnFocus && selected.value > focused.value.array.length - 1) {
                      selected.value = selected.value - 1
                    }
                  })
            
            deleteTab({ index: focused.value.location, done })
          },
        )
      ],
    })
  }


  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      role: 'tablist',
      ariaOrientation: orientation,
    }
  })

  bind({
    element: tabs.elements,
    values: {
      id: ({ index }) => tabs.ids.value[index],
      role: 'tab',
      ariaControls: ({ index }) => panels.ids.value[index],
      ariaHaspopup: !!openMenu,
      ariaDisabled: {
        get: ({ index }) => getAbility(index) === 'disabled' ? true : undefined,
        watchSources: ensureWatchSourcesFromStatus(abilityOption),
      },
    },
  })

  bind({
    element: panels.elements,
    values: {
      id: ({ index }) => panels.ids.value[index],
      role: 'tabpanel',
      tabindex: {
        get: ({ index }) => getPanelContentsFocusability(index) === 'not focusable' ? 0 : undefined,
        watchSources: ensureWatchSourcesFromStatus(panelContentsFocusability),
      },
      ariaLabelledby: ({ index }) => tabs.ids.value[index],
      ariaHidden: {
        get: ({ index }) => {
          if (index !== selected.value) return true
        },
        watchSources: selected,
      },
    },
  })

  if (openMenu) {
    on<ListenableKeycombo>({
      element: tabs.elements,
      effects: defineEffect => [
        defineEffect(
          openMenuKeycombo,
          event => {
            event.preventDefault()
            openMenu({ index: focused.value.location })
          },
        )
      ],
    })
  }


  // API
  return {
    root,
    tabs,
    panels,
    focused: computed(() => focused.value.location),
    selected: computed(() => selected.value),
    select: index => select(index),
    focus: focus,
    is: {
      selected: index => index === selected.value,
      focused: index => index === focused.value.location,
    },
    getStatuses: index => {
      const ability = getAbility(index),
            focusStatus = focused.value.location === index ? 'focused' : 'blurred',
            selectStatus = selected.value === index ? 'selected' : 'deselected'

      return [ability, focusStatus, selectStatus]
    },
  }
}
