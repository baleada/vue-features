import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { show, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useElementApi,
  ensureGetStatus,
  ensureWatchSourcesFromStatus,
  useListState,
} from '../extracted'
import type {
  IdentifiedElementApi,
  IdentifiedListApi,
  ListState,
  UseListStateConfig,
  StatusOption,
} from '../extracted'

export type Tablist = {
  root: IdentifiedElementApi<HTMLElement>,
  tabs: IdentifiedListApi<HTMLElement>,
  panels: IdentifiedListApi<HTMLElement>,
  focused: ComputedRef<number>,
  selected: ComputedRef<number>,
} & Omit<ListState<false>, 'focused' | 'selected' | 'deselect'>

export type UseTablistOptions = {
  transition?: { panel?: TransitionOption<Ref<HTMLElement[]>> },
  panelContentsFocusability?: StatusOption<IdentifiedListApi<HTMLElement>['elements'], 'focusable' | 'not focusable'>,
  disabledTabsReceiveFocus?: boolean,
} & Partial<Omit<UseListStateConfig<false>, 'elementsApi' | 'multiselectable' | 'disabledElementsReceiveFocus' | 'query'>>

const defaultOptions: UseTablistOptions = {
  initialSelected: 0,
  orientation: 'horizontal',
  selectsOnFocus: true,
  loops: true,
  disabledTabsReceiveFocus: true,
  ability: () => 'enabled',
  panelContentsFocusability: () => 'not focusable',
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
  const root: Tablist['root'] = useElementApi({ identified: true }),
        tabs: Tablist['tabs'] = useElementApi({ kind: 'list', identified: true }),
        panels: Tablist['panels'] = useElementApi({ kind: 'list', identified: true })


  // UTILS
  const getPanelContentsFocusability = ensureGetStatus(panels.elements, panelContentsFocusability)


  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, is, getStatuses } = useListState({
    elementsApi: tabs,
    ability: abilityOption,
    initialSelected,
    orientation,
    multiselectable: false,
    clearable: false,
    selectsOnFocus,
    disabledElementsReceiveFocus: disabledTabsReceiveFocus,
    loops,
    popup: false,
    transfersFocus: true,
  })

  
  // SELECTED
  show(
    panels.elements,
    {
      get: index => index === selected.value.newest,
      watchSource: () => selected.value.newest,
    },
    { transition: transition?.panel }
  )


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'tablist',
      ariaOrientation: orientation,
    }
  )

  bind(
    tabs.elements,
    {
      id: index => tabs.ids.value[index],
      role: 'tab',
      ariaControls: index => panels.ids.value[index],
    },
  )

  bind(
    panels.elements,
    {
      id: index => panels.ids.value[index],
      role: 'tabpanel',
      tabindex: {
        get: index => getPanelContentsFocusability(index) === 'not focusable' ? 0 : undefined,
        watchSource: ensureWatchSourcesFromStatus(panelContentsFocusability),
      },
      ariaLabelledby: index => tabs.ids.value[index],
      ariaHidden: {
        get: index => {
          if (index !== selected.value.newest) return true
        },
        watchSource: () => selected.value.newest,
      },
    },
  )


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
