import { createFocusable } from '@baleada/logic'
import { show, bind } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useListApi,
  narrowTransitionOption,
  useListFeatures,
  toLabelBindValues,
  defaultLabelMeta,
  ariaHiddenFocusableOn,
  createListFeaturesMultiRef,
  useRootAndKeyboardTarget,
} from '../extracted'
import type {
  ListApi,
  ListFeatures,
  TransitionOptionCreator,
  LabelMeta,
  Ability,
  RootAndKeyboardTarget,
} from '../extracted'
import type { UseListboxOptions } from './useListbox'

export type Tablist = (
  & TablistBase
  & Omit<ListFeatures<false>, 'planeApi' | 'focusedItem' | 'selectedItems'>
  & {
    focusedTab: ListFeatures<false>['focusedItem'],
    selectedTab: ListFeatures<false>['selectedItems'],
  }
)

type TablistBase = (
  & RootAndKeyboardTarget<LabelMeta>
  & {
    tabs: ListApi<
      HTMLElement,
      true,
      { ability?: Ability } & LabelMeta
    >,
    panels: ListApi<
      HTMLElement,
      true
    >,
  }
)

export type UseTablistOptions = (
  & Partial<Omit<
    UseListboxOptions<false, false>,
    | 'disabledOptionsReceiveFocus'
    | 'multiselectable'
    | 'clears'
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
  initialKeyboardStatus: 'selecting',
  loops: false,
  needsAriaOwns: false,
  orientation: 'vertical',
  query: { matchThreshold: 1 },
  receivesFocus: true,
  transition: {},
}

export function useTablist (options: UseTablistOptions = {}): Tablist {
  // OPTIONS
  const {
    disabledTabsReceiveFocus,
    initialFocused,
    initialSelected,
    initialKeyboardStatus,
    loops,
    needsAriaOwns,
    orientation,
    query,
    receivesFocus,
    transition,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const { root, keyboardTarget } = useRootAndKeyboardTarget({ defaultRootMeta: defaultLabelMeta }),
        tabs: Tablist['tabs'] = useListApi({
          identifies: true,
          defaultMeta: { ability: 'enabled', ...defaultLabelMeta },
        }),
        panels: Tablist['panels'] = useListApi({ identifies: true })


  // MULTIPLE CONCERNS
  const {
          planeApi,
          focusedItem,
          selectedItems,
          ...listFeatures
        } = useListFeatures({
          rootApi: root,
          keyboardTargetApi: keyboardTarget,
          listApi: tabs,
          clears: false,
          disabledElementsReceiveFocus: disabledTabsReceiveFocus,
          initialFocused,
          initialSelected,
          initialSuperselectedFrom: 0,
          initialKeyboardStatus,
          loops,
          multiselectable: false,
          needsAriaOwns,
          orientation,
          query,
          receivesFocus,
        }),
        tabsRef: Tablist['tabs']['ref'] = createListFeaturesMultiRef({
          orientation,
          listApiRef: tabs.ref,
          planeApiRef: planeApi.ref,
        })


  // SELECTED
  show(
    panels.list,
    {
      get: index => index === selectedItems.newest,
      watchSource: () => selectedItems.newest,
    },
    { transition: narrowTransitionOption(panels.list, transition?.panel) }
  )


  // FOCUS
  ariaHiddenFocusableOn({
    root: root.element,
    list: panels.list,
    selectedItems,
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
          || selectedItems.newest !== index
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
          if (index !== selectedItems.newest) return true
        },
        watchSource: () => selectedItems.newest,
      },
    },
  )


  // API
  return {
    root,
    keyboardTarget,
    tabs: {
      ...tabs,
      ref: tabsRef,
    },
    panels,
    focusedTab: focusedItem,
    selectedTab: selectedItems,
    ...listFeatures,
  }
}
