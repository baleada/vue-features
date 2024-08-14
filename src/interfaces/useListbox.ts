import { watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind } from '../affordances'
import {
  useHistory,
  useListApi,
  useListFeatures,
  toLabelBindValues,
  defaultLabelMeta,
  createListFeaturesMultiRef,
  useRootAndKeyboardTarget,
} from '../extracted'
import type {
  ListApi,
  History,
  ListFeatures,
  UseListFeaturesConfig,
  LabelMeta,
  Ability,
  RootAndKeyboardTarget,
} from '../extracted'

export type Listbox<Multiselectable extends boolean = false> = (
  & ListboxBase
  & Omit<ListFeatures<Multiselectable>, 'planeApi' | 'focusedItem' | 'selectedItems'>
  & {
    focusedOption: ListFeatures<Multiselectable>['focusedItem'],
    selectedOptions: ListFeatures<Multiselectable>['selectedItems'],
  }
)

type ListboxBase = (
  & RootAndKeyboardTarget<LabelMeta>
  & {
    options: ListApi<
      HTMLElement,
      true,
      {
        candidate?: string,
        ability?: Ability
      } & LabelMeta
    >,
    history: History<{
      focused: Navigateable<HTMLElement>['location'],
      selected: Pickable<HTMLElement>['picks'],
    }>,
  }
)

export type UseListboxOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = true
> = (
  & Partial<Omit<
    UseListFeaturesConfig<Multiselectable, Clears>,
    | 'rootApi'
    | 'listApi'
    | 'disabledElementsReceiveFocus'
    | 'multiselectable'
    | 'clears'
  >>
  & {
    multiselectable?: Multiselectable,
    clears?: Clears,
    disabledOptionsReceiveFocus?: boolean,
  }
)

const defaultOptions: UseListboxOptions<false, true> = {
  clears: true,
  disabledOptionsReceiveFocus: true,
  initialFocused: 'selected',
  initialSelected: 0,
  initialSuperselectedFrom: 0,
  initialKeyboardStatus: 'focusing',
  loops: false,
  multiselectable: false,
  needsAriaOwns: false,
  orientation: 'vertical',
  query: { matchThreshold: 1 },
  receivesFocus: true,
}

export function useListbox<
  Multiselectable extends boolean = false,
  Clears extends boolean = true
> (options: UseListboxOptions<Multiselectable, Clears> = {}): Listbox<Multiselectable> {
  // OPTIONS
  const {
    clears,
    disabledOptionsReceiveFocus,
    initialFocused,
    initialSelected,
    initialSuperselectedFrom,
    initialKeyboardStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    orientation,
    query,
    receivesFocus,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable, Clears>)


  // ELEMENTS
  const { root, keyboardTarget } = useRootAndKeyboardTarget({ defaultRootMeta: defaultLabelMeta }),
        optionsApi: Listbox<true>['options'] = useListApi({
          identifies: true,
          defaultMeta: {
            candidate: '',
            ability: 'enabled',
            ...defaultLabelMeta,
          },
        })


  // MULTIPLE CONCERNS
  const {
          planeApi,
          focusedItem,
          selectedItems,
          ...listFeatures
        } = useListFeatures({
          rootApi: root,
          keyboardTargetApi: keyboardTarget,
          listApi: optionsApi,
          clears,
          disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
          initialFocused,
          initialSelected,
          initialSuperselectedFrom,
          initialKeyboardStatus,
          loops,
          multiselectable: multiselectable as true,
          needsAriaOwns,
          orientation,
          query,
          receivesFocus,
        }),
        optionsRef: Listbox<true>['options']['ref'] = createListFeaturesMultiRef({
          orientation,
          listApiRef: optionsApi.ref,
          planeApiRef: planeApi.ref,
        })


  // HISTORY
  const history: Listbox<true>['history'] = useHistory()

  watch(
    () => history.entries.location,
    () => {
      const item = history.entries.item
      focusedItem.navigate(item.focused)
      selectedItems.pick(item.selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focusedItem.location,
    selected: selectedItems.picks,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'listbox',
      ...toLabelBindValues(root),
    }
  )

  bind(
    optionsApi.list,
    {
      role: 'option',
      ...toLabelBindValues(optionsApi),
    }
  )


  // API
  return {
    root,
    keyboardTarget,
    options: {
      ...optionsApi,
      ref: optionsRef,
    },
    history,
    focusedOption: focusedItem,
    selectedOptions: selectedItems,
    ...listFeatures,
  } as Listbox<Multiselectable>
}
