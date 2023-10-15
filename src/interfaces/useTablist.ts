import { show, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useElementApi,
  narrowTransitionOption,
  useListState,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type {
  IdentifiedElementApi,
  IdentifiedListApi,
  ListState,
  UseListStateConfig,
  TransitionOptionCreator,
  LabelMeta,
} from '../extracted'

export type Tablist = {
  root: IdentifiedElementApi<HTMLElement, LabelMeta>,
  tabs: IdentifiedListApi<
    HTMLElement,
    { ability: 'enabled' | 'disabled' } & LabelMeta
  >,
  panels: IdentifiedListApi<
    HTMLElement,
    { focusability: 'focusable' | 'not focusable' }
  >,
} & Omit<ListState<false>, 'deselect'>

export type UseTablistOptions = {
  transition?: {
    panel?: TransitionOption<Tablist['panels']['elements']>
      | TransitionOptionCreator<Tablist['panels']['elements']>,
  },
  disabledTabsReceiveFocus?: boolean,
} & Partial<Omit<UseListStateConfig<false>, 'list' | 'multiselectable' | 'disabledElementsReceiveFocus' | 'query'>>

const defaultOptions: UseTablistOptions = {
  initialSelected: 0,
  orientation: 'horizontal',
  selectsOnFocus: true,
  loops: true,
  disabledTabsReceiveFocus: true,
  stopsPropagation: false,
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
    stopsPropagation,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root: Tablist['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
        tabs: Tablist['tabs'] = useElementApi({
          kind: 'list',
          identifies: true,
          defaultMeta: { ability: 'enabled', ...defaultLabelMeta },
        }),
        panels: Tablist['panels'] = useElementApi({
          kind: 'list',
          identifies: true,
          defaultMeta: { focusability: 'not focusable' },
        })


  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, is, getStatuses } = useListState({
    root,
    list: tabs,
    initialSelected,
    orientation,
    multiselectable: false,
    clears: false,
    selectsOnFocus,
    disabledElementsReceiveFocus: disabledTabsReceiveFocus,
    loops,
    popsUp: false,
    transfersFocus: true,
    stopsPropagation,
  })

  
  // SELECTED
  show(
    panels.elements,
    {
      get: index => index === selected.newest,
      watchSource: () => selected.newest,
    },
    { transition: narrowTransitionOption(panels.elements, transition?.panel) }
  )


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'tablist',
      ...toLabelBindValues(root),
      ariaOrientation: orientation,
    }
  )

  bind(
    tabs.elements,
    {
      role: 'tab',
      ...toLabelBindValues(tabs),
      ariaControls: index => panels.ids.value[index],
    },
  )

  bind(
    panels.elements,
    {
      role: 'tabpanel',
      tabindex: index => panels.meta.value[index].focusability === 'not focusable' ? 0 : undefined,
      ariaLabelledby: index => tabs.ids.value[index],
      ariaHidden: {
        get: index => {
          if (index !== selected.newest) return true
        },
        watchSource: () => selected.newest,
      },
    },
  )


  // API
  return {
    root,
    tabs,
    panels,
    focused,
    focus,
    selected,
    select,
    is,
    getStatuses,
  }
}
