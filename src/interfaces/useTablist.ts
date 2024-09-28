import { createFocusable } from '@baleada/logic'
import {
  show,
  bind,
  type TransitionOption,
} from '../affordances'
import {
  useListApi,
  narrowTransitionOption,
  useListFeatures,
  defaultLabelMeta,
  ariaHiddenFocusManage,
  createListFeaturesMultiRef,
  useRootAndKeyboardTarget,
  defaultAbilityMeta,
  type ListApi,
  type ListFeatures,
  type TransitionOptionCreator,
  type LabelMeta,
  type RootAndKeyboardTarget,
  type Orientation,
  type AbilityMeta,
  type SupportedElement,
} from '../extracted'
import { type UseListboxOptions } from './useListbox'

export type Tablist<O extends Orientation = 'horizontal'> = (
  & TablistBase
  & Omit<ListFeatures<false, O>, 'planeApi' | 'focusedItem' | 'selectedItems'>
  & {
    focusedTab: ListFeatures<false, O>['focusedItem'],
    selectedTab: ListFeatures<false, O>['selectedItems'],
  }
)

type TablistBase = (
  & RootAndKeyboardTarget<LabelMeta & AbilityMeta>
  & {
    tabs: ListApi<
      SupportedElement,
      true,
      LabelMeta & AbilityMeta
    >,
    panels: ListApi<
      SupportedElement,
      true
    >,
  }
)

export type UseTablistOptions<O extends Orientation = 'horizontal'> = (
  & Partial<Omit<
    UseListboxOptions<false, false, O>,
    | 'disabledOptionsReceiveFocus'
    | 'multiselectable'
    | 'clears'
  >>
  & {
    disabledTabsReceiveFocus?: boolean,
    transition?: {
      panel?: (
        | TransitionOption<Tablist<O>['panels']['list']>
        | TransitionOptionCreator<Tablist<O>['panels']['list']>
      ),
    },
  }
)

const defaultOptions: UseTablistOptions<'horizontal'> = {
  disabledTabsReceiveFocus: true,
  initialFocused: 'selected',
  initialSelected: 0,
  initialKeyboardStatus: 'selecting',
  loops: false,
  needsAriaOwns: false,
  orientation: 'horizontal',
  query: { matchThreshold: 1 },
  receivesFocus: true,
  transition: {},
}

export function useTablist<O extends Orientation = 'horizontal'> (options: UseTablistOptions<O> = {}): Tablist<O> {
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
  const { root, keyboardTarget } = useRootAndKeyboardTarget({
          defaultRootMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
          },
          defaultKeyboardTargetMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            targetability: 'targetable',
          },
        }),
        tabs: Tablist['tabs'] = useListApi({
          identifies: true,
          defaultMeta: { ...defaultLabelMeta, ...defaultAbilityMeta },
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
  ariaHiddenFocusManage({
    root: root.element,
    list: panels.list,
    selectedItems,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    { role: 'tablist' }
  )

  bind(
    tabs.list,
    {
      role: 'tab',
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
  } as Tablist<O>
}
