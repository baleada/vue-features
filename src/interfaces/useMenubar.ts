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
  type ListApi,
  type History,
  type ListFeatures,
  type LabelMeta,
  type RootAndKeyboardTarget,
  type Orientation,
  type AbilityMeta,
  type SupportedElement,
} from '../extracted'
import { type UseListboxOptions } from './useListbox'

export type Menubar<
  Multiselectable extends boolean = true,
  O extends Orientation = 'vertical',
> = (
  & MenubarBase
  & Omit<ListFeatures<Multiselectable, O>, 'planeApi'>
)

type MenubarBase = (
  & RootAndKeyboardTarget<LabelMeta & AbilityMeta>
  & {
    items: ListApi<
      SupportedElement,
      true,
      (
        & LabelMeta
        & AbilityMeta
        & {
          candidate?: string,
          kind?: 'item' | 'checkbox' | 'radio',
          checked?: boolean,
          group?: string,
        }
      )
    >,
    history: History<{
      focused: Navigateable<SupportedElement>['location'],
      selected: Pickable<SupportedElement>['picks'],
    }>,
  }
)

export type UseMenubarOptions<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
> = (
  & Partial<Omit<
    UseListboxOptions<Multiselectable, Clears, O>,
    'disabledOptionsReceiveFocus'
  >>
  & {
    disabledItemsReceiveFocus?: boolean,
    visuallyPersists?: boolean,
  }
)

const defaultOptions: UseMenubarOptions<true, true, 'vertical'> = {
  clears: true,
  disabledItemsReceiveFocus: true,
  initialFocused: 'selected',
  initialSelected: 0,
  initialSuperselectedFrom: 0,
  initialKeyboardStatus: 'focusing',
  loops: false,
  multiselectable: true,
  needsAriaOwns: false,
  orientation: 'vertical',
  query: { matchThreshold: 1 },
  receivesFocus: true,
  visuallyPersists: false,
}

export function useMenubar<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
> (options: UseMenubarOptions<Multiselectable, Clears, O> = {}): Menubar<Multiselectable, O> {
  // OPTIONS
  const {
    clears,
    disabledItemsReceiveFocus,
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
    visuallyPersists,
  } = ({ ...defaultOptions, ...options } as UseMenubarOptions<Multiselectable, Clears>)


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
        items: Menubar['items'] = useListApi({
          identifies: true,
          defaultMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            candidate: '',
            kind: 'item',
            checked: false,
            group: '',
          },
        })


  // MULTIPLE CONCERNS
  const {
          planeApi,
          focusedItem,
          selectedItems,
          is,
          ...listFeatures
        } = useListFeatures({
          rootApi: root,
          keyboardTargetApi: keyboardTarget,
          listApi: items,
          clears,
          disabledElementsReceiveFocus: disabledItemsReceiveFocus,
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
        itemsRef: Menubar['items']['ref'] = createListFeaturesMultiRef({
          orientation,
          listApiRef: items.ref,
          planeApiRef: planeApi.ref,
        })


  // HISTORY
  const history: Menubar['history'] = useHistory()

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
    { role: visuallyPersists ? 'menubar' : 'menu' }
  )

  bind(
    items.list,
    {
      role: index => {
        const { kind } = items.meta.value[index]

        return kind === 'item'
          ? 'menuitem'
          : `menuitem${kind}`
      },
      // TODO: abstract for checkbox?
      ariaChecked: {
        get: index => (
          items.meta.value[index].kind === 'item'
            ? undefined
            : is.selected(index)
        ),
        watchSource: () => selectedItems.picks,
      },
    }
  )

  // API
  return {
    root,
    keyboardTarget,
    items: {
      ...items,
      ref: itemsRef,
    },
    history,
    focusedItem,
    selectedItems,
    is,
    ...listFeatures,
  } as Menubar<Multiselectable, O>
}
