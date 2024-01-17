import { show, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useElementApi,
  useListApi,
  narrowTransitionOption,
  useListFeatures,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type {
  ElementApi,
  ListApi,
  ListFeatures,
  TransitionOptionCreator,
  LabelMeta,
} from '../extracted'
import type { UseListboxOptions } from './useListbox'

export type Tablist = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
  tabs: ListApi<
    HTMLElement,
    true,
    { ability?: 'enabled' | 'disabled' } & LabelMeta
  >,
  panels: ListApi<
    HTMLElement,
    true,
    { focusability?: 'focusable' | 'not focusable' }
  >,
} & Omit<ListFeatures<false>, 'deselect'>

export type UseTablistOptions = (
  & Partial<Omit<
    UseListboxOptions<false, false>,
    'disabledOptionsReceiveFocus'
  >>
  & {
    disabledTabsReceiveFocus?: boolean,
    transition?: {
      panel?: TransitionOption<Tablist['panels']['list']>
        | TransitionOptionCreator<Tablist['panels']['list']>,
    },
  }
)

const defaultOptions: UseTablistOptions = {
  disabledTabsReceiveFocus: true,
  initialSelected: 0,
  loops: true,
  orientation: 'horizontal',
  queryMatchThreshold: 1,
  selectsOnFocus: true,
}

export function useTablist (options: UseTablistOptions = {}): Tablist {
  // OPTIONS
  const {
    disabledTabsReceiveFocus,
    initialSelected,
    loops,
    orientation,
    queryMatchThreshold,
    selectsOnFocus,
    transition,
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
  const {
    focused,
    focus,
    query,
    type,
    paste,
    results,
    search,
    selected,
    select,
    press,
    release,
    pressStatus,
    pressed,
    released,
    is,
    getStatuses,
  } = useListFeatures({
    rootApi: root,
    listApi: tabs,
    clears: false,
    disabledElementsReceiveFocus: disabledTabsReceiveFocus,
    initialSelected,
    loops,
    multiselectable: false,
    needsAriaOwns: false,
    orientation,
    queryMatchThreshold,
    selectsOnFocus,
    transfersFocus: true,
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
    query,
    type,
    paste,
    results,
    search,
    selected,
    select,
    press,
    release,
    pressStatus,
    pressed,
    released,
    is,
    getStatuses,
  }
}
