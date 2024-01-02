import { show, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useElementApi,
  useListApi,
  narrowTransitionOption,
  useListState,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type {
  ElementApi,
  ListApi,
  ListState,
  UseListStateConfig,
  TransitionOptionCreator,
  LabelMeta,
} from '../extracted'

export type Tablist = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
  tabs: ListApi<
    HTMLElement,
    true,
    { ability: 'enabled' | 'disabled' } & LabelMeta
  >,
  panels: ListApi<
    HTMLElement,
    true,
    { focusability: 'focusable' | 'not focusable' }
  >,
} & Omit<ListState<false>, 'deselect'>

export type UseTablistOptions = {
  transition?: {
    panel?: TransitionOption<Tablist['panels']['list']>
      | TransitionOptionCreator<Tablist['panels']['list']>,
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
        tabs: Tablist['tabs'] = useListApi({
          identifies: true,
          defaultMeta: { ability: 'enabled', ...defaultLabelMeta },
        }),
        panels: Tablist['panels'] = useListApi({
          identifies: true,
          defaultMeta: { focusability: 'not focusable' },
        })


  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, is, getStatuses } = useListState({
    rootApi: root,
    listApi: tabs,
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
    panels.list,
    {
      get: index => index === selected.newest,
      watchSource: () => selected.newest,
    },
    { transition: narrowTransitionOption(panels.list, transition?.panel) }
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
    tabs.list,
    {
      role: 'tab',
      ...toLabelBindValues(tabs),
      ariaControls: index => panels.ids.value?.[index],
    },
  )

  bind(
    panels.list,
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
