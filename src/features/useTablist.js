// Designed to the specifications listed here: https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel

import { ref, computed, onBeforeUpdate, watch, onMounted, isRef, nextTick } from 'vue'
import { useConditionalDisplay, useListenables, useBindings } from '../affordances'
import { useId } from '../util'
import { useNavigateable } from '@baleada/vue-composition'

const defaultOptions = {
  selectsPanelOnTabFocus: true,
  openMenuKeycombo: 'shift+f10',
  deleteTabKeycombo: 'delete',
}

// type Options = undefined | {
//   selectsPanelOnTabFocus?: boolean,
//   openMenu?: () => void,
//   deleteTab?: () => void,
//   label: string,
// }

export default function useTablist ({ totalTabs, orientation }, options = {}) {
  // Process arguments
  const eachable = computed(() => isRef(totalTabs) ? toIterable(totalTabs.value) : toIterable(totalTabs)),
        {
          selectsPanelOnTabFocus,
          openMenu,
          deleteTab,
          label,
          openMenuKeycombo,
          deleteTabKeycombo,
        } = { ...defaultOptions, ...options }

  // Set up core state
  const navigateable = useNavigateable(eachable.value),
        selectedPanel = ref(navigateable.value.location),
        selectedTab = computed({
          get: () => navigateable.value.location,
          set: location => navigateable.value.navigate(location)
        })
  
  if (selectsPanelOnTabFocus) {
    watch(
      () => selectedTab.value,
      () => selectedPanel.value = selectedTab.value,
    )
  }

  watch(
    () => eachable.value,
    () => navigateable.value.setArray(eachable.value),
    { flush: 'post' }
  )
  
  // Set up API
  const rootEl = ref(null),
        labelEl = ref(null),
        tabs = (() => {
          const els = ref([]),
                htmlIds = useId({ target: els, watchSources: eachable })

          return { els, htmlIds }
        })(),
        panels = (() => {
          const els = ref([]),
                htmlIds = useId({ target: els, watchSources: eachable })

          return { els, htmlIds }
        })(),
        labelId = label ? undefined : useId({ target: labelEl })

  onBeforeUpdate(() => {
    tabs.els.value = []
    panels.els.value = []
  })


  // Bind accessibility attributes
  if (!label) {
    // If there is no label, a label el is required for accessibility.
    // This code will throw an error otherwise.
    useBindings({
      target: labelEl,
      bindings: { id: labelId },
    })
  }
  
  useBindings({
    target: rootEl,
    bindings: {
      // The element that serves as the container for the set of tabs has role tablist. 
      role: 'tablist',
      // If the tablist element is vertically oriented, it has the property aria-orientation set to vertical. The default value of aria-orientation for a tablist element is horizontal. 
      ariaOrientation: orientation,
      // If the tab list has a visible label, the element with role tablist has aria-labelledby set to a value that refers to the labelling element. Otherwise, the tablist element has a label provided by aria-label. 
      [label ? 'ariaLabel' : 'ariaLabelledby']: label || labelId,
    }
  })

  // tabs
  useBindings({
    target: tabs.els,
    bindings: {
      tabindex: 0,
      id: ({ index }) => tabs.htmlIds.value[index],
      // Each element that serves as a tab has role tab and is contained within the element with role tablist.
      role: 'tab',
      // Each element with role tab has the property aria-controls referring to its associated tabpanel element.
      ariaControls: ({ index }) => panels.htmlIds.value[index],
      // The active tab element has the state aria-selected set to true and all other tab elements have it set to false.
      ariaSelected: {
        targetClosure: ({ index }) => index === selectedTab.value,
        watchSources: selectedTab,
      },
      // If a tab element has a pop-up menu, it has the property aria-haspopup set to either menu or true. 
      ariaHaspopup: !!openMenu,
    },
  })

  // panels
  useBindings({
    target: panels.els,
    bindings: {
      id: ({ index }) => panels.htmlIds.value[index],
      // Each element that contains the content panel for a tab has role tabpanel.
      role: 'tabpanel',
      // Each element with role tabpanel has the property aria-labelledby referring to its associated tab element. 
      ariaLabelledby: ({ index }) => tabs.htmlIds.value[index],
      ariaHidden: {
        targetClosure: ({ index }) => index !== selectedPanel.value,
        watchSources: selectedPanel,
      },
    },
  })


  // Manage panel visibility
  useConditionalDisplay({
    target: panels.els,
    condition: ({ index }) => index === selectedPanel.value,
    watchSources: selectedPanel,
  })

  
  // Manage navigateable tab
  const tabFocusUpdates = ref(0),
        forceTabFocusUpdate = () => tabFocusUpdates.value++
  onMounted(() => {
    watch(
      [
        selectedTab,
        tabFocusUpdates,
      ],
      () => {
        // Guard against already-focused tabs
        if (tabs.els.value[selectedTab.value].isSameNode(document.activeElement)) {
          return
        }
        
        tabs.els.value[selectedTab.value].focus()
      },
      { flush: 'post' }
    )
  })

  useListenables({
    target: tabs.els,
    listenables: {
      mousedown: {
        targetClosure: ({ index }) => () => {
          navigateable.value.navigate(index)
          if (!selectsPanelOnTabFocus) {
            selectedPanel.value = selectedTab.value
          }
        }
      },

      // When focus moves into the tab list, places focus on the tab that controls the selected tab panel.
      focusin: {
        targetClosure: ({ index }) => event => {
          const { relatedTarget } = event

          // When a tab is deleted, the relatedTarget during the ensuing focus transfer is "null".
          //
          // In this case, navigateable.location and selectedPanel are handled in the delete
          // handler and should not follow this handler's logic.
          if (relatedTarget === null) {
            return
          }
          
          if (tabs.els.value.some(el => el.isSameNode(relatedTarget))) {
            navigateable.value.navigate(index)
            return
          }

          event.preventDefault()
          navigateable.value.navigate(selectedPanel.value)
          forceTabFocusUpdate()
        }
      },

      // When focus is on a tab element in a horizontal tab list:
      // Left Arrow: moves focus to the previous tab. If focus is on the first tab, moves focus to the last tab. Optionally, activates the newly focused tab (See note below).
      // Right Arrow: Moves focus to the next tab. If focus is on the last tab element, moves focus to the first tab. Optionally, activates the newly focused tab (See note below).

      // If the tabs in a tab list are arranged vertically:
      // Down Arrow performs as Right Arrow is described above.
      // Up Arrow performs as Left Arrow is described above.
      ...(() => {
        switch (orientation) {
          case 'horizontal':
            return {
              right (event) {
                event.preventDefault()
                navigateable.value.next()
              },
              left (event) {
                event.preventDefault()
                navigateable.value.previous()
              },
            }
          case 'vertical': 
            return {
              down (event) {
                event.preventDefault()
                navigateable.value.next()
              },
              up (event) {
                event.preventDefault()
                navigateable.value.previous()
              },
            }
        }
      })(),
      
      // Space or Enter: Activates the tab if it was not selected automatically on focus.
      ...(() => 
        selectsPanelOnTabFocus
          ? {}
          : {
              space (event) {
                event.preventDefault()
                selectedPanel.value = navigateable.value.location
              },
              enter (event) {
                event.preventDefault()
                selectedPanel.value = navigateable.value.location
              }
            }
      )(),

      // Home (Optional): Moves focus to the first tab.
      home (event) {
        event.preventDefault()
        navigateable.value.first()
      },
      // End (Optional): Moves focus to the last tab.
      end (event) {
        event.preventDefault()
        navigateable.value.last()
      },
      
      // Shift + F10: If the tab has an associated pop-up menu, opens the menu.
      ...(() => {
        return openMenu
          ? {
              [openMenuKeycombo]: function (event) {
                event.preventDefault()
                openMenu(navigateable.value.location)
              }
            }
          : {}
      })(),
      
      // Delete (Optional): If deletion is allowed, deletes (closes) the current tab element and its associated tab panel, sets focus on the tab following the tab that was closed, and optionally activates the newly focused tab. If there is not a tab that followed the tab that was deleted, e.g., the deleted tab was the right-most tab in a left-to-right horizontal tab list, sets focus on and optionally activates the tab that preceded the deleted tab. If the application allows all tabs to be deleted, and the user deletes the last remaining tab in the tab list, the application moves focus to another element that provides a logical work flow. As an alternative to Delete, or in addition to supporting Delete, the delete function is available in a context menu. 
      ...(() => {
        return deleteTab
          ? {
              [deleteTabKeycombo]: function (event) {
                event.preventDefault()
                
                const cached = navigateable.value.location
                deleteTab(navigateable.value.location)
                
                nextTick(() => {
                  navigateable.value.navigate(cached)
                  forceTabFocusUpdate()

                  if (!selectsPanelOnTabFocus && selectedPanel.value === cached) {
                    selectedPanel.value = navigateable.value.location
                  }

                  if (!selectsPanelOnTabFocus && selectedPanel.value > navigateable.value.array.length - 1) {
                    selectedPanel.value = selectedPanel.value - 1
                  }

                })
              }
            }
          : {}
      })(),
    }
  })

  const tablist = {
    tabs: index => el => {
      if (el) tabs.els.value[index] = el
    },
    panels: index => el => {
      if (el) panels.els.value[index] = el
    },
    root: () => el => (rootEl.value = el),
    navigateable,
    selected: {
      panel: selectedPanel,
      tab: selectedTab,
    },
  }
  
  if (!label) {
    tablist.label = () => el => (labelEl.value = el)
  }

  return tablist
}

function toIterable (total) {
  return (new Array(total))
    .fill()
    .map((_, index) => index)
}
