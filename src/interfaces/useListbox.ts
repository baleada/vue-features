import { watch } from 'vue'
import { type Navigateable, type Pickable } from '@baleada/logic'
import { bind } from '../affordances'
import {
  useHistory,
  useListApi,
  useListFeatures,
  defaultLabelMeta,
  createListFeaturesMultiRef,
  useRootAndKeyboardTarget,
  defaultAbilityMeta,
  defaultValidityMeta,
  type ListApi,
  type History,
  type ListFeatures,
  type UseListFeaturesConfig,
  type LabelMeta,
  type RootAndKeyboardTarget,
  type Orientation,
  type AbilityMeta,
  type ValidityMeta,
  type SupportedElement,
} from '../extracted'

export type Listbox<
  Multiselectable extends boolean = false,
  O extends Orientation = 'vertical',
> = (
  & ListboxBase
  & Omit<ListFeatures<Multiselectable, O>, 'planeApi' | 'focusedItem' | 'selectedItems'>
  & {
    focusedOption: ListFeatures<Multiselectable, O>['focusedItem'],
    selectedOptions: ListFeatures<Multiselectable, O>['selectedItems'],
  }
)

type ListboxBase = (
  & RootAndKeyboardTarget<LabelMeta & AbilityMeta & ValidityMeta>
  & {
    options: ListApi<
      SupportedElement,
      true,
      (
        & LabelMeta
        & AbilityMeta
        & { candidate?: string }
      )
    >,
    history: History<{
      focused: Navigateable<SupportedElement>['location'],
      selected: Pickable<SupportedElement>['picks'],
    }>,
  }
)

export type UseListboxOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
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
  O extends Orientation = 'vertical',
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
  const { root, keyboardTarget } = useRootAndKeyboardTarget({
          defaultRootMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            ...defaultValidityMeta,
          },
          defaultKeyboardTargetMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            ...defaultValidityMeta,
            targetability: 'targetable',
          },
        }),
        optionsApi: Listbox<true, 'vertical'>['options'] = useListApi({
          identifies: true,
          defaultMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            candidate: '',
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
    { role: 'listbox' }
  )

  bind(
    optionsApi.list,
    { role: 'option' }
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
