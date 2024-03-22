import { createFocusable } from '@baleada/logic'
import { show, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useElementApi,
  useListApi,
  narrowTransitionOption,
  useListFeatures,
  toLabelBindValues,
  defaultLabelMeta,
  ariaHiddenFocusableOn,
} from '../extracted'
import type {
  ElementApi,
  ListApi,
  ListFeatures,
  TransitionOptionCreator,
  LabelMeta,
  Ability,
} from '../extracted'
import type { UseListboxOptions } from './useListbox'

export type Tablist = (
  {
    root: ElementApi<HTMLElement, true, LabelMeta>,
    tabs: ListApi<
      HTMLElement,
      true,
      { ability?: Ability } & LabelMeta
    >,
    panels: ListApi<
      HTMLElement,
      true
    >,
    getTabStatuses: ListFeatures<false>['getStatuses'],
    beforeUpdate: () => void,
  }
  & Omit<ListFeatures<false>, 'getStatuses'>
)

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
  initialFocused: 'selected',
  initialSelected: 0,
  initialStatus: 'focusing',
  loops: true,
  orientation: 'horizontal',
  queryMatchThreshold: 1,
}

export function useTablist (options: UseTablistOptions = {}): Tablist {
  // OPTIONS
  const {
    disabledTabsReceiveFocus,
    initialFocused,
    initialSelected,
    initialStatus,
    loops,
    orientation,
    queryMatchThreshold,
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
        panels: Tablist['panels'] = useListApi({ identifies: true })


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
    deselect,
    status,
    focusing,
    selecting,
    toggle,
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
    initialFocused,
    initialSelected,
    initialStatus,
    loops,
    multiselectable: false,
    needsAriaOwns: false,
    orientation,
    queryMatchThreshold,
    receivesFocus: true,
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


  // FOCUS
  ariaHiddenFocusableOn({
    rootApi: root,
    listApi: panels,
    selected,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'tablist',
      ...toLabelBindValues(root),
    }
  )

  bind(
    tabs.list,
    {
      role: 'tab',
      ...toLabelBindValues(tabs),
      ariaControls: {
        get: index => panels.ids.value?.[index],
        watchSource: () => panels.ids.value,
      },
    },
  )

  bind(
    panels.list,
    {
      role: 'tabpanel',
      tabindex: {
        get: index => (
          createFocusable('first')(panels.list.value[index])
          || selected.newest !== index
        )
          ? undefined
          : 0,
        watchSource: () => panels.list.value,
      },
      ariaLabelledby: {
        get: index => tabs.ids.value[index],
        watchSource: () => tabs.ids.value,
      },
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
    deselect,
    status,
    focusing,
    selecting,
    toggle,
    press,
    release,
    pressStatus,
    pressed,
    released,
    is,
    getTabStatuses: getStatuses,
    query,
    type,
    paste,
    results,
    search,
    beforeUpdate: () => {
      tabs.beforeUpdate()
      panels.beforeUpdate()
    },
  }
}
