import { computed } from 'vue'
import type { ComputedRef, } from 'vue'
import { show, bind } from '../affordances'
import type { BindValueGetterWithWatchSources, TransitionOption } from '../affordances'
import {
  useElementApi,
  ensureGetStatus,
  ensureWatchSourcesFromStatus,
  useFocusedAndSelected,
} from '../extracted'
import type {
  SingleElementApi,
  MultipleIdentifiedElementsApi,
  BindValue,
  FocusedAndSelected,
  UseFocusedAndSelectedConfig,
} from '../extracted'

export type Tablist = {
  root: SingleElementApi<HTMLElement>,
  tabs: MultipleIdentifiedElementsApi<HTMLElement>,
  panels: MultipleIdentifiedElementsApi<HTMLElement>,
  focused: ComputedRef<number>,
  selected: ComputedRef<number>,
} & Omit<FocusedAndSelected<false>, 'focused' | 'selected' | 'deselect'>

export type UseTablistOptions = {
  transition?: { panel?: TransitionOption },
  panelContentsFocusability?: BindValue<'focusable' | 'not focusable'> | BindValueGetterWithWatchSources<'focusable' | 'not focusable'>,
  disabledTabsReceiveFocus?: boolean,
} & Partial<Omit<UseFocusedAndSelectedConfig<false>, 'elementsApi' | 'multiselectable' | 'disabledElementsReceiveFocus' | 'query'>>

const defaultOptions: UseTablistOptions = {
  initialSelected: 0,
  orientation: 'horizontal',
  selectsOnFocus: true,
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
    selectsOnFocus,
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
  const getPanelContentsFocusability = ensureGetStatus({ element: panels.elements, status: panelContentsFocusability })


  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, is, getStatuses } = useFocusedAndSelected({
    elementsApi: tabs,
    ability: abilityOption,
    initialSelected,
    orientation,
    multiselectable: false,
    selectsOnFocus,
    disabledElementsReceiveFocus: disabledTabsReceiveFocus,
    loops,
  })

  
  // SELECTED
  show(
    {
      element: panels.elements,
      condition: {
        get: ({ index }) => index === selected.value.newest,
        watchSource: selected,
      }
    },
    { transition: transition?.panel }
  )


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
    },
  })

  bind({
    element: panels.elements,
    values: {
      id: ({ index }) => panels.ids.value[index],
      role: 'tabpanel',
      tabindex: {
        get: ({ index }) => getPanelContentsFocusability(index) === 'not focusable' ? 0 : undefined,
        watchSource: ensureWatchSourcesFromStatus(panelContentsFocusability),
      },
      ariaLabelledby: ({ index }) => tabs.ids.value[index],
      ariaHidden: {
        get: ({ index }) => {
          if (index !== selected.value.newest) return true
        },
        watchSource: selected,
      },
    },
  })


  // API
  return {
    root,
    tabs,
    panels,
    focused: computed(() => focused.value.location),
    focus,
    selected: computed(() => selected.value.newest),
    select,
    is,
    getStatuses,
  }
}
