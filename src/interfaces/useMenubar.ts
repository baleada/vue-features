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
  LabelMeta,
  Ability,
  RootAndKeyboardTarget,
} from '../extracted'
import type { UseListboxOptions } from './useListbox'

export type Menubar<Multiselectable extends boolean = true> = (
  & MenubarBase
  & Omit<ListFeatures<Multiselectable>, 'planeApi'>
)

type MenubarBase = (
  & RootAndKeyboardTarget<LabelMeta>
  & {
    items: ListApi<
      HTMLElement,
      true,
      {
        candidate?: string,
        ability?: Ability,
        kind?: 'item' | 'checkbox' | 'radio',
        checked?: boolean,
        groupName?: string,
      } & LabelMeta
    >,
    history: History<{
      focused: Navigateable<HTMLElement>['location'],
      selected: Pickable<HTMLElement>['picks'],
    }>,
  }
)

export type UseMenubarOptions<
  Multiselectable extends boolean = true,
  Clears extends boolean = true
> = (
  & Partial<Omit<
    UseListboxOptions<Multiselectable, Clears>,
    'disabledOptionsReceiveFocus'
  >>
  & {
    disabledItemsReceiveFocus?: boolean,
    visuallyPersists?: boolean,
  }
)

const defaultOptions: UseMenubarOptions<true, true> = {
  clears: true,
  disabledItemsReceiveFocus: true,
  initialFocused: 'selected',
  initialSelected: 0,
  initialSuperselectedFrom: 0,
  initialStatus: 'focusing',
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
  Clears extends boolean = true
> (options: UseMenubarOptions<Multiselectable, Clears> = {}): Menubar<Multiselectable> {
  // OPTIONS
  const {
    clears,
    disabledItemsReceiveFocus,
    initialFocused,
    initialSelected,
    initialSuperselectedFrom,
    initialStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    orientation,
    query,
    receivesFocus,
    visuallyPersists,
  } = ({ ...defaultOptions, ...options } as UseMenubarOptions<Multiselectable, Clears>)


  // ELEMENTS
  const { root, keyboardTarget } = useRootAndKeyboardTarget({ defaultRootMeta: defaultLabelMeta }),
        items: Menubar['items'] = useListApi({
          identifies: true,
          defaultMeta: {
            candidate: '',
            ability: 'enabled',
            kind: 'item',
            checked: false,
            groupName: '',
            ...defaultLabelMeta,
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
          initialStatus,
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
    {
      role: visuallyPersists ? 'menubar' : 'menu',
      ...toLabelBindValues(root),
    }
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
      ...toLabelBindValues(items),
      ariaChecked: {
        get: index => items.meta.value[index].kind === 'item'
          ? undefined
          : is.selected(index),
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
  } as Menubar<Multiselectable>
}
