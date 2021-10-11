import { ref, computed, watch, watchPostEffect, onMounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useNavigateable } from '@baleada/vue-composition'
import type { Navigateable, ListenableKeycombo } from '@baleada/logic'
import { show, on, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import { useElementApi } from '../extracted'
import type {
  SingleElementApi,
  MultipleIdentifiedElementsApi,
} from '../extracted'

export type Tablist = {
  root: SingleElementApi<HTMLElement>,
  tabs: MultipleIdentifiedElementsApi<HTMLElement>,
  panels: MultipleIdentifiedElementsApi<HTMLElement>,
  selected: Ref<{
    panel: number,
    tab: number,
  }>,
  is: {
    selected: {
      panel: (index: number) => boolean,
      tab: (index: number) => boolean,
    },
  },
  select: {
    panel: (index: number) => void,
    tab: (index: number) => void,
  },
  navigateable: Ref<Navigateable<HTMLElement>>,
}

export type UseTablistOptions = {
  initialSelected?: number,
  orientation?: 'horizontal' | 'vertical'
  selectsPanelOnTabFocus?: boolean,
  openMenu?: ({ index }: { index: number }) => void,
  deleteTab?: ({ index, done }: { index: number, done: () => void }) => void,
  openMenuKeycombo?: ListenableKeycombo,
  deleteTabKeycombo?: ListenableKeycombo,
  transition?: { panel?: TransitionOption },
}

const defaultOptions: UseTablistOptions = {
  initialSelected: 0,
  orientation: 'horizontal',
  selectsPanelOnTabFocus: true,
  openMenuKeycombo: 'shift+f10',
  deleteTabKeycombo: 'delete' as '+delete',
}

export function useTablist (options: UseTablistOptions = {}): Tablist {
  // OPTIONS
  const {
    initialSelected,
    orientation,
    selectsPanelOnTabFocus,
    openMenuKeycombo,
    deleteTabKeycombo,
    openMenu,
    deleteTab,
    transition,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root: Tablist['root'] = useElementApi(),
        tabs: Tablist['tabs'] = useElementApi({ multiple: true, identified: true }),
        panels: Tablist['panels'] = useElementApi({ multiple: true, identified: true })

        debugger

  console.log(panels.ids)


  // SELECTED TAB
  const navigateable: Tablist['navigateable'] = useNavigateable(tabs.elements.value),
        selectedTab = computed({
          get: () => navigateable.value.location,
          set: location => navigateable.value.navigate(location)
        }),
        tabFocusUpdates = ref(0),
        forceTabFocusUpdate = () => tabFocusUpdates.value++,
        assignInitialSelected = () => {
          selectedTab.value = initialSelected
          selectedPanel.value = initialSelected
        }

  onMounted(() => {
    watchPostEffect(() => navigateable.value.setArray(tabs.elements.value))
    assignInitialSelected()
  })
        
  onMounted(() => {
    watch(
      [
        selectedTab,
        tabFocusUpdates,
      ],
      () => {
        // Guard against already-focused tabs
        if (tabs.elements.value[selectedTab.value].isSameNode(document.activeElement)) {
          return
        }
        
        (tabs.elements.value[selectedTab.value] as HTMLElement).focus()
      },
      { flush: 'post' }
    )
  })

  on<'focusin' | '+right' | '+left' | '+down' | '+up' | '+home' | '+end'>({
    element: tabs.elements,
    effects: defineEffect => [
      defineEffect(
        'focusin',
        {
          createEffect: ({ index }) => event => {
            const { relatedTarget } = event

            // When a tab is deleted, the relatedTarget during the ensuing focus transfer is "null".
            //
            // In this case, navigateable.location and selectedPanel are handled in the delete
            // handler and should not follow this handler's logic.
            if (relatedTarget === null) {
              return
            }
            
            if (tabs.elements.value.some(element => element.isSameNode(relatedTarget as Node))) {
              navigateable.value.navigate(index)
              return
            }

            event.preventDefault()
            navigateable.value.navigate(selectedPanel.value)
            forceTabFocusUpdate()
          }
        }
      ),
      // When focus is on a tab element in a horizontal tab list:
      // Left Arrow: moves focus to the previous tab. If focus is on the first tab, moves focus to the last tab. Optionally, activates the newly focused tab (See note below).
      // Right Arrow: Moves focus to the next tab. If focus is on the last tab element, moves focus to the first tab. Optionally, activates the newly focused tab (See note below).

      // If the tabs in a tab list are arranged vertically:
      // Down Arrow performs as Right Arrow is described above.
      // Up Arrow performs as Left Arrow is described above.
      ...(() => {
        switch (orientation) {
          case 'horizontal':
            return [
              defineEffect(
                'right' as '+right',
                event => {
                  event.preventDefault()
                  navigateable.value.next()
                }
              ),
              defineEffect(
                'left' as '+left',
                event => {
                  event.preventDefault()
                  navigateable.value.previous()
                }
              ),
            ]
          case 'vertical': 
            return [
              defineEffect(
                'down' as '+down',
                event => {
                  event.preventDefault()
                  navigateable.value.next()
                }
              ),
              defineEffect(
                'up' as '+up',
                event => {
                  event.preventDefault()
                  navigateable.value.previous()
                }
              ),
            ]
        }
      })(),
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          navigateable.value.first()
        }
      ),
      defineEffect(
        'end' as '+end',
        event => {
          event.preventDefault()
          navigateable.value.last()
        }
      ),
    ],
  })


  // SELECTED PANEL
  const selectedPanel = ref(navigateable.value.location)

  if (selectsPanelOnTabFocus) {
    watch(
      () => selectedTab.value,
      () => selectedPanel.value = selectedTab.value,
    )
  }

  show(
    {
      element: panels.elements,
      condition: {
        getValue: ({ index }) => index === selectedPanel.value,
        watchSources: selectedPanel,
      }
    },
    { transition: transition?.panel }
  )

  on<'pointerup' | '+space' | '+enter'>({
    element: tabs.elements,
    effects: defineEffect => [
      defineEffect(
        'pointerup',
        {
          createEffect: ({ index }) => () => {
            navigateable.value.navigate(index)
            if (!selectsPanelOnTabFocus) {
              selectedPanel.value = selectedTab.value
            }
          }
        }
      ),
      ...(() => 
        selectsPanelOnTabFocus
          ? []
          : [
              defineEffect(
                'space' as '+space',
                event => {
                  event.preventDefault()
                  selectedPanel.value = navigateable.value.location
                }
              ),
              defineEffect(
                'enter' as '+enter',
                event => {
                  event.preventDefault()
                  selectedPanel.value = navigateable.value.location
                }
              ),
            ]
      )(),
    ],
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
            
            const cached = navigateable.value.location,
                  done = () => nextTick(() => {
                    navigateable.value.navigate(cached)
                    forceTabFocusUpdate()
          
                    if (!selectsPanelOnTabFocus && selectedPanel.value === cached) {
                      selectedPanel.value = navigateable.value.location
                    }
          
                    if (!selectsPanelOnTabFocus && selectedPanel.value > navigateable.value.array.length - 1) {
                      selectedPanel.value = selectedPanel.value - 1
                    }
                  })
            
            deleteTab({ index: navigateable.value.location, done })
          },
        )
      ],
    })
  }


  // WAI ARIA BASICS
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
      tabindex: 0,
      id: ({ index }) => tabs.ids.value[index],
      role: 'tab',
      ariaControls: ({ index }) => panels.ids.value[index],
      ariaSelected: {
        getValue: ({ index }) => index === selectedTab.value,
        watchSources: selectedTab,
      },
      ariaHaspopup: !!openMenu,
    },
  })

  bind({
    element: panels.elements,
    values: {
      id: ({ index }) => panels.ids.value[index],
      role: 'tabpanel',
      ariaLabelledby: ({ index }) => tabs.ids.value[index],
      ariaHidden: {
        getValue: ({ index }) => index !== selectedPanel.value,
        watchSources: selectedPanel,
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
            openMenu({ index: navigateable.value.location })
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
    selected: computed(() => ({
      panel: selectedPanel.value,
      tab: selectedTab.value,
    })),
    is: {
      selected: {
        panel: index => index === selectedPanel.value,
        tab: index => index === selectedTab.value,
      },
    },
    select: {
      panel: index => {
        if (selectsPanelOnTabFocus) {
          selectedTab.value = index
          return
        }
        
        selectedPanel.value = index
      },
      tab: index => selectedTab.value = index,
    },
    navigateable,
  }
}
