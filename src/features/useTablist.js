// Designed to the specifications listed here: https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel

import { ref, computed, onBeforeUpdate, watch, onMounted, nextTick, watchEffect } from 'vue'
import { useConditionalDisplay, useListenables, useBindings } from '../affordances'
import { useId } from '../util'
import { useNavigateable } from '@baleada/vue-composition'

const defaultOptions = {
  tabFocusSelectsPanel: true
}

// type Options = undefined | {
//   tabFocusSelectsPanel?: boolean,
//   openMenu?: () => void,
//   deleteTab?: () => void,
// }

export default function useTablist ({ metadata, orientation }, options = {}) {
  const { tabFocusSelectsPanel, openMenu, deleteTab, label } = { ...defaultOptions, ...options }

  // Set up initial state
  const rootEl = ref(null),
        labelEl = ref(null),
        tabEls = ref([]),
        panelEls = ref([]),
        navigateable = useNavigateable(metadata),
        selectedPanelIndex = ref(navigateable.value.location)
  
  if (tabFocusSelectsPanel) {
    watchEffect(() => selectedPanelIndex.value = navigateable.value.location)
  }

  onBeforeUpdate(() => {
    tabEls.value = []
    panelEls.value = []
  })

  // Set up API
  const tabs = metadata.map(({ tab }, index) => {
          const el = computed(() => tabEls.value[index]),
                status = computed(() => index === navigateable.value.location ? 'selected' : 'unselected'),
                id = useId(el)          

          return { tab, id, el, status }
        }),
        panels = metadata.map(({ panel }, index) => {
          const el = computed(() => panelEls.value[index]),
                status = computed(() => index === selectedPanelIndex.value ? 'selected' : 'unselected'),
                id = useId(el)

          return { panel, id, el, status }
        }),
        labelId = useId(labelEl)


  // Bind accessibility attributes
  if (!label) {
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

  tabs.forEach(({ el, id, status }, index) => {
    useBindings({
      target: el,
      bindings: {
        tabindex: 0,
        id,
        // Each element that serves as a tab has role tab and is contained within the element with role tablist.
        ariaRole: 'tab',
        // Each element with role tab has the property aria-controls referring to its associated tabpanel element.
        ariaControls: computed(() => panels[index].id.value),
        // The active tab element has the state aria-selected set to true and all other tab elements have it set to false.
        ariaSelected: computed(() => status.value === 'selected'),
        // If a tab element has a pop-up menu, it has the property aria-haspopup set to either menu or true. 
        ariaHaspopup: !!openMenu,
      },
    })
  })
  
  panels.forEach(({ el, id }, index) => {
    useBindings({
      target: el,
      bindings: {
        tabindex: 0,
        id,
        // Each element that contains the content panel for a tab has role tabpanel.
        ariaRole: 'tabpanel',
        // Each element with role tabpanel has the property aria-labelledby referring to its associated tab element. 
        ariaLabelledby: computed(() => tabs[index].id.value),
      },
    })
  })


  // Manage navigateable tab
  tabs.forEach(({ el }, index) => {
    useListenables({
      target: el,
      listeners: {
        click: () => (navigateable.value.navigate(index))
      }
    })
  })

  panels.forEach(({ el, status }) => {
    useConditionalDisplay({ target: el, condition: computed(() => status.value === 'selected') })
  })

  onMounted(() => {
    watch(() => navigateable.value.location, () => {
      // Guard against already-focused tabs
      if (tabEls.value[navigateable.value.location].isSameNode(document.activeElement)) {
        return
      }

      tabEls.value[navigateable.value.location].focus()
    })
  })

  tabs.forEach(({ el }, index) => {
    useListenables({
      target: el,
      listeners: {
        // When focus moves into the tab list, places focus on the tab that controls the selected tab panel.
        focus (event) {
          const { relatedTarget } = event

          if (tabEls.value.some(el => el.isSameNode(relatedTarget))) {
            navigateable.value.navigate(index)
            return
          }

          event.preventDefault()
          navigateable.value.navigate(selectedPanelIndex.value)
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
          tabFocusSelectsPanel
            ? {}
            : {
                click (event) {
                  event.preventDefault()
                  selectedPanelIndex.value = navigateable.value.location
                },
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
        'shift+f10': function (event) {
          event.preventDefault()
          openMenu?.()
        },
        
        // Delete (Optional): If deletion is allowed, deletes (closes) the current tab element and its associated tab panel, sets focus on the tab following the tab that was closed, and optionally activates the newly focused tab. If there is not a tab that followed the tab that was deleted, e.g., the deleted tab was the right-most tab in a left-to-right horizontal tab list, sets focus on and optionally activates the tab that preceded the deleted tab. If the application allows all tabs to be deleted, and the user deletes the last remaining tab in the tab list, the application moves focus to another element that provides a logical work flow. As an alternative to Delete, or in addition to supporting Delete, the delete function is available in a context menu. 
        delete: function (event) {
          event.preventDefault()
          
          if (!deleteTab) return

          const location = navigateable.value.location
          deleteTab(location)
          navigateable.value.array = navigateable.value.array.filter((item, index) => index !== location)
          navigateable.value.navigate(location)
        }
      }
    })
  })

  const tablist = {
    tabs: {
      ref: el => tabEls.value.push(el),
      values: tabs,
      navigateable,
    },
    panels: {
      ref: el => panelEls.value.push(el),
      values: panels,
      selectedIndex: selectedPanelIndex,
    },
    root: {
      ref: el => (rootEl.value = el),
    },
  }
  
  if (!label) {
    tablist.label = {
      ref: el => (labelEl.value = el),
    }
  }

  return tablist
}
