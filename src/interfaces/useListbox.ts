import { watch } from 'vue'
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
  UseListFeaturesConfig,
  LabelMeta,
} from '../extracted'

export type Listbox<Multiselectable extends boolean = false> = (
  & ListboxBase
  & Omit<ListFeatures<Multiselectable>, 'getStatuses'>
  & {
    getOptionStatuses: ListFeatures<Multiselectable>['getStatuses']
  }
)

type ListboxBase = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
  options: ListApi<
    HTMLElement,
    true,
    {
      candidate?: string,
      ability?: 'enabled' | 'disabled'
    } & LabelMeta
  >,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
  beforeUpdate: () => void,
}

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
    | 'query'
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
  initialSelected: 0,
  loops: false,
  multiselectable: false,
  needsAriaOwns: false,
  orientation: 'vertical',
  queryMatchThreshold: 1,
  selectsOnFocus: false,
  transfersFocus: true,
}

export function useListbox<
  Multiselectable extends boolean = false,
  Clears extends boolean = true
> (options: UseListboxOptions<Multiselectable, Clears> = {}): Listbox<Multiselectable> {
  // OPTIONS
  const {
    clears,
    disabledOptionsReceiveFocus,
    initialSelected,
    loops,
    multiselectable,
    needsAriaOwns,
    orientation,
    queryMatchThreshold,
    selectsOnFocus,
    transfersFocus,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<true>['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
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
    press,
    release,
    pressStatus,
    pressed,
    released,
    is,
    getStatuses,
  } = useListFeatures({
    rootApi: root,
    listApi: optionsApi,
    clears,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    initialSelected,
    loops,
    multiselectable: multiselectable as true,
    needsAriaOwns,
    orientation,
    queryMatchThreshold,
    selectsOnFocus,
    transfersFocus,
  })


  // HISTORY
  const history: Listbox<true>['history'] = useHistory()

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
    options: optionsApi,
    focused,
    focus,
    selected,
    select,
    deselect,
    press,
    release,
    pressStatus,
    pressed,
    released,
    is,
    getOptionStatuses: getStatuses,
    history,
    query,
    results,
    search,
    type,
    paste,
    beforeUpdate: () => optionsApi.beforeUpdate(),
  } as unknown as Listbox<Multiselectable>
}
