// https://www.w3.org/WAI/ARIA/apg/patterns/menu/
import { computed, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  useListApi,
  useListFeatures,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type {
  ElementApi,
  ListApi,
  History,
  ListFeatures,
  LabelMeta,
  Ability,
} from '../extracted'
import type { UseListboxOptions } from './useListbox'

export type Menubar<Multiselectable extends boolean = true> = (
  & MenubarBase
  & Omit<ListFeatures<Multiselectable>, 'getStatuses'>
  & { getItemStatuses: ListFeatures<Multiselectable>['getStatuses'] }
)

type MenubarBase = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
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
  beforeUpdate: () => void,
}

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
  initialStatus: 'focusing',
  loops: false,
  multiselectable: true,
  needsAriaOwns: false,
  orientation: 'vertical',
  queryMatchThreshold: 1,
  receivesFocus: true,
  visuallyPersists: false,
}

export function useMenubar<
  Multiselectable extends boolean = true,
  Clears extends boolean = true
> (options: UseMenubarOptions<Multiselectable, Clears> = {}): Menubar {
  // OPTIONS
  const {
    clears,
    disabledItemsReceiveFocus,
    initialFocused,
    initialSelected,
    initialStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    orientation,
    queryMatchThreshold,
    receivesFocus,
    visuallyPersists,
  } = ({ ...defaultOptions, ...options } as UseMenubarOptions)


  // ELEMENTS
  const root: Menubar['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
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
    focused,
    focus,
    query,
    results,
    type,
    paste,
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
    listApi: items,
    clears,
    disabledElementsReceiveFocus: disabledItemsReceiveFocus,
    initialFocused,
    initialSelected,
    initialStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    orientation,
    queryMatchThreshold,
    receivesFocus,
  })


  // HISTORY
  const history: Menubar['history'] = useHistory()

  watch(
    () => history.entries.location,
    () => {
      const item = history.entries.item
      focused.navigate(item.focused)
      selected.pick(item.selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.location,
    selected: selected.picks,
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
        watchSource: () => selected.picks,
      },
    }
  )

  // API
  return {
    root,
    items,
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
    getItemStatuses: getStatuses,
    history,
    query: computed(() => query.value),
    results,
    search,
    type,
    paste,
    beforeUpdate: () => items.beforeUpdate(),
  } as unknown as Menubar
}
