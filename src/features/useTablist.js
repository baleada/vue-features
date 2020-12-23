// Designed to the specifications listed here: https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel

import { ref, computed, onBeforeUpdate, watch, onMounted, isRef, nextTick } from 'vue'
import { useConditionalDisplay, useListenables, useBindings } from '../affordances'
import { useIds } from '../util'
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

export default function useTablist ({ tabIds: rawTabIds, orientation }, options = {}) {
  // Process arguments
  const tabIds = computed(() => isRef(rawTabIds) ? rawTabIds.value : rawTabIds),
        {
          selectsPanelOnTabFocus,
          openMenu,
          deleteTab,
          label,
          openMenuKeycombo,
          deleteTabKeycombo,
        } = { ...defaultOptions, ...options }

  // Set up core state
  const navigateable = useNavigateable(tabIds.value),
        selectedPanelIndex = ref(navigateable.value.location)
  
  if (selectsPanelOnTabFocus) {
    watch(
      () => navigateable.value.location, 
      () => selectedPanelIndex.value = navigateable.value.location
    )
  }

  watch(
    () => tabIds.value,
    () => navigateable.value.setArray(tabIds.value)
  )

  
  // Set up API
  const rootEl = ref(null),
        labelEl = ref(null),
        tabsFocusStatuses = ref(tabIds.value.map(id => ({ id, tabFocusStatus: 'ready' }))),
        tabs = (() => {
          const els = ref([]),
                statuses = computed(() => 
                  tabIds.value.map(id => ({ id, status: id === navigateable.value.item ? 'selected' : 'unselected' }))
                ),
                htmlIds = useIds({ target: els, watchSources: [() => tabIds.value] })

          return { els, statuses, htmlIds }
        })(),
        panels = (() => {
          const els = ref([]),
                statuses = computed(() => 
                  tabIds.value.map(id => ({ id, status: id === selectedPanelIndex.value ? 'selected' : 'unselected' }))
                ),
                htmlIds = useIds({ target: els, watchSources: [() => tabIds.value] })

          return { els, statuses, htmlIds }
        })(),
        labelId = computed(() => useIds({ target: labelEl }).value[0])

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
      ariaRole: 'tablist',
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
      ariaRole: 'tab',
      // Each element with role tab has the property aria-controls referring to its associated tabpanel element.
      ariaControls: ({ index }) => panels.htmlIds.value[index],
      // The active tab element has the state aria-selected set to true and all other tab elements have it set to false.
      ariaSelected: ({ index }) => tabs.statuses.value[index] === 'selected',
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
      ariaRole: 'tabpanel',
      // Each element with role tabpanel has the property aria-labelledby referring to its associated tab element. 
      ariaLabelledby: ({ index }) => tabs.htmlIds.value[index],
    },
  })


  // Manage panel visibility
  useConditionalDisplay({
    target: panels.els,
    condition: ({ index }) => panels.statuses.value[index] === 'selected',
    watchSource: panels.statuses,
  })

  
  // Manage navigateable tab
  onMounted(() => {
    watch(
      [
        () => navigateable.value.location, 
        () => tabsFocusStatuses.value,
      ],
      () => {
        // Guard against already-focused tabs
        if (tabs.els.value[navigateable.value.location].isSameNode(document.activeElement)) {
          return
        }
        
        tabs.els.value[navigateable.value.location].focus()
      }
    )
  })

  tabIds.value.forEach((id, index) => {
    useListenables({
      target: computed(() => tabs.els.value.find(byId(id)).el),
      listeners: {
        mousedown () {
          navigateable.value.navigate(index)
          if (!selectsPanelOnTabFocus) {
            selectedPanelIndex.value = navigateable.value.location  
          }
        },

        // When focus moves into the tab list, places focus on the tab that controls the selected tab panel.
        focusin (event) {
          const { relatedTarget } = event

          if (tabs.els.value.some(el => el.isSameNode(relatedTarget))) {
            navigateable.value.navigate(index)
            return
          }

          event.preventDefault()
          navigateable.value.navigate(selectedPanelIndex.value)

          // It's possible to expose this status tracking to the user. For now, though, it primarily
          // exists to ensure the navigateable.location watcher is triggered.
          tabsFocusStatuses.value = tabsFocusStatuses.value.map(({ id: i, tabFocusStatus }) => {
            switch (tabFocusStatus) {
              case 'ready':
              case 'blurred':
                return i === id ? 'focused' : tabFocusStatus
              case 'focused':
                return i !== id ? 'blurred' : tabFocusStatus
            }
          })
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
                  selectedPanelIndex.value = navigateable.value.location
                },
                enter (event) {
                  event.preventDefault()
                  selectedPanelIndex.value = navigateable.value.location
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
                  tabs.tabIds.splice(navigateable.value.location, 1)
                  panels.tabIds.splice(navigateable.value.location, 1)
                  navigateable.value.navigate(cached)
                  // Possibly need to force update here if location hasn't changed
                }
              }
            : {}
        })(),
      }
    })
  })


  const tablist = {
    tabs: {
      ref: index => el => (tabs.els.value[index] = el),
      data: computed(() =>
        tabIds.value.map(id => ({ id, status: tabs.statuses.value.find(byId(id)).status }))
      ),
    },
    panels: {
      ref: index => el => (panels.els.value[index] = el),
      data: computed(() =>
        tabIds.value.map(id => ({ id, status: panels.statuses.value.find(byId(id)).status }))
      ),
    },
    root: {
      ref: () => el => (rootEl.value = el),
    },
    navigateable,
    selectedPanelIndex,
  }
  
  if (!label) {
    tablist.label = {
      ref: () => el => (labelEl.value = el),
    }
  }

  return tablist
}

function byId (id) {
  return ({ id: i }) => i === id
}
