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
  Orientation,
} from '../extracted'

export type Listbox<
  Multiselectable extends boolean = false,
  O extends Orientation = 'vertical'
> = (
  & ListboxBase
  & Omit<ListFeatures<Multiselectable, O>, 'planeApi' | 'focusedItem' | 'selectedItems'>
  & {
    focusedOption: ListFeatures<Multiselectable, O>['focusedItem'],
    selectedOptions: ListFeatures<Multiselectable, O>['selectedItems'],
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
  Clears extends boolean = true,
  O extends Orientation = 'vertical'
> = (
  & Partial<Omit<
    UseListFeaturesConfig<Multiselectable, Clears, O>,
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

const defaultOptions: UseListboxOptions<false, true, 'vertical'> = {
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
  Clears extends boolean = true,
  O extends Orientation = 'vertical'
> (options: UseListboxOptions<Multiselectable, Clears, O> = {}): Listbox<Multiselectable, O> {
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
        optionsApi: Listbox<true, 'vertical'>['options'] = useListApi({
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
        optionsRef: Listbox<true, 'vertical'>['options']['ref'] = createListFeaturesMultiRef({
          orientation,
          listApiRef: optionsApi.ref,
          planeApiRef: planeApi.ref,
        })


  // HISTORY
  const history: Listbox<true, 'vertical'>['history'] = useHistory()

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
  } as Listbox<Multiselectable, O>
}
