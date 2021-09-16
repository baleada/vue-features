// Based on this pattern: https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel
import { ref, computed, watch, watchPostEffect, onMounted, nextTick } from 'vue'
import type { Ref, WritableComputedRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition'
import type { Navigateable, ListenableKeycombo } from '@baleada/logic'
import { show, on, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useOptionalStoreable,
  useMultipleIds,
  useSingleElement,
  useMultipleElements,
  useLabel,
  useDescription,
  preventEffect,
} from '../extracted'
import type {
  SingleElement,
  MultipleElements,
  OptionalStoreable,
} from '../extracted'

export type Tablist<StoreableKey extends string> = {
  root: SingleElement<HTMLElement>,
  tabs: MultipleElements<HTMLElement>,
  panels: MultipleElements<HTMLElement>,
  selected: {
    panel: Ref<number>,
    tab: WritableComputedRef<number>,
  },
  isSelected: {
    panel: (index: number) => boolean,
    tab: (index: number) => boolean,
  },
  navigateable: Ref<Navigateable<HTMLElement>>,
  storeable: OptionalStoreable<StoreableKey>,
  label: ReturnType<typeof useLabel>,
  description: ReturnType<typeof useDescription>,

}

export type UseTablistOptions<StoreableKey extends string> = {
  initialSelected?: number,
  orientation?: 'horizontal' | 'vertical'
  selectsPanelOnTabFocus?: boolean,
  openMenu?: ({ index }: { index: number }) => void,
  deleteTab?: ({ index, done }: { index: number, done: () => void }) => void,
  label?: string,
  openMenuKeycombo?: ListenableKeycombo,
  deleteTabKeycombo?: ListenableKeycombo,
  transition?: { panel?: TransitionOption },
  storeableKey?: StoreableKey,
}

const defaultOptions: UseTablistOptions<ReturnType<typeof preventEffect>> = {
  initialSelected: 0,
  orientation: 'horizontal',
  selectsPanelOnTabFocus: true,
  openMenuKeycombo: 'shift+f10',
  deleteTabKeycombo: 'delete' as '+delete',
  storeableKey: preventEffect(),
}

export function useTablist<StoreableKey extends string = ''> (options: UseTablistOptions<StoreableKey> = {}): Tablist<StoreableKey> {
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
    storeableKey,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root: Tablist<StoreableKey>['root'] = useSingleElement(),
        tabs: Tablist<StoreableKey>['tabs'] = useMultipleElements(),
        panels: Tablist<StoreableKey>['panels'] = useMultipleElements(),
        label: Tablist<StoreableKey>['label'] = useLabel(root.element, { text: options.label }),
        description: Tablist<StoreableKey>['description'] = useDescription(root.element)


  // SELECTED TAB
  const navigateable: Tablist<StoreableKey>['navigateable'] = useNavigateable(tabs.elements.value),
        selectedTab: Tablist<StoreableKey>['selected']['tab'] = computed({
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
      // When focus moves into the tab list, places focus on the tab that controls the selected tab panel.
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
      
      // Home (Optional): Moves focus to the first tab.
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          navigateable.value.first()
        }
      ),
      // End (Optional): Moves focus to the last tab.
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
  const selectedPanel: Tablist<StoreableKey>['selected']['panel'] = ref(navigateable.value.location)

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

      // Space or Enter: Activates the tab if it was not selected automatically on focus.
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

  
  // STOREABLE
  const storeable: Tablist<StoreableKey>['storeable'] = useOptionalStoreable({
    key: storeableKey,
    optOutEffect: () => assignInitialSelected(),
    optInEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const selected = JSON.parse(storeable.value.string)
          selectedTab.value = selected.tab
          selectedPanel.value = selected.panel
          break
        case 'ready':
        case 'removed':
          assignInitialSelected()
          break
      }
    },
    getString: () => JSON.stringify({ tab: selectedTab.value, panel: selectedPanel.value }),
  })


  // MULTIPLE CONCERNS
  if (deleteTab) {
    on<ListenableKeycombo>({
      element: tabs.elements,
      effects: defineEffect => [
        // Delete (Optional): If deletion is allowed, deletes (closes) the current tab element and its associated tab panel, sets focus on the tab following the tab that was closed, and optionally activates the newly focused tab. If there is not a tab that followed the tab that was deleted, e.g., the deleted tab was the right-most tab in a left-to-right horizontal tab list, sets focus on and optionally activates the tab that preceded the deleted tab. If the application allows all tabs to be deleted, and the user deletes the last remaining tab in the tab list, the application moves focus to another element that provides a logical work flow. As an alternative to Delete, or in addition to supporting Delete, the delete function is available in a context menu. 
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
  const tabIds = useMultipleIds(tabs.elements),
        panelIds = useMultipleIds(panels.elements)
  
  bind({
    element: root.element,
    values: {
      // The element that serves as the container for the set of tabs has role tablist. 
      role: 'tablist',
      // If the tablist element is vertically oriented, it has the property aria-orientation set to vertical. The default value of aria-orientation for a tablist element is horizontal. 
      ariaOrientation: orientation,
    }
  })

  bind({
    element: tabs.elements,
    values: {
      tabindex: 0,
      id: ({ index }) => tabIds.value[index],
      // Each element that serves as a tab has role tab and is contained within the element with role tablist.
      role: 'tab',
      // Each element with role tab has the property aria-controls referring to its associated tabpanel element.
      ariaControls: ({ index }) => panelIds.value[index],
      // The active tab element has the state aria-selected set to true and all other tab elements have it set to false.
      ariaSelected: {
        getValue: ({ index }) => index === selectedTab.value,
        watchSources: selectedTab,
      },
      // If a tab element has a pop-up menu, it has the property aria-haspopup set to either menu or true. 
      ariaHaspopup: !!openMenu,
    },
  })

  bind({
    element: panels.elements,
    values: {
      id: ({ index }) => panelIds.value[index],
      // Each element that contains the content panel for a tab has role tabpanel.
      role: 'tabpanel',
      // Each element with role tabpanel has the property aria-labelledby referring to its associated tab element. 
      ariaLabelledby: ({ index }) => tabIds.value[index],
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
        // Shift + F10: If the tab has an associated pop-up menu, opens the menu.
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
    selected: {
      panel: selectedPanel,
      tab: selectedTab,
    },
    isSelected: {
      panel: index => index === selectedPanel.value,
      tab: index => index === selectedTab.value,
    },
    navigateable,
    storeable,
    label,
    description,
  }
}
