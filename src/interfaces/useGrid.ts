import { watch } from 'vue'
import { bind } from '../affordances'
import {
  useHistory,
  usePlaneFeatures,
  toLabelBindValues,
  defaultLabelMeta,
  usePlaneApi,
  useListApi,
  toTokenList,
  useRootAndKeyboardTarget,
} from '../extracted'
import type {
  ListApi,
  PlaneApi,
  History,
  PlaneFeatures,
  UsePlaneFeaturesConfig,
  LabelMeta,
  Ability,
  Coordinates,
  RootAndKeyboardTarget,
} from '../extracted'
import { createMultiRef } from '../transforms'

export type Grid<Multiselectable extends boolean = false> = (
  & GridBase
  & PlaneFeatures<Multiselectable>
)

type GridBase = (
  & RootAndKeyboardTarget<LabelMeta>
  & {
    rowgroups: ListApi<HTMLElement, true>,
    rows: ListApi<HTMLElement, true>,
    cells: PlaneApi<
      HTMLElement,
      true,
      {
        candidate?: string,
        ability?: Ability,
        span?: {
          row?: number,
          column?: number,
        },
        kind?: 'cell' | 'rowheader' | 'columnheader',
      } & LabelMeta
    >,
    history: History<{
      focused: Coordinates,
      selected: Coordinates[],
    }>,
  }
)

export type UseGridOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = (
  & UseGridOptionsBase<Multiselectable, Clears>
  & Partial<Omit<
    UsePlaneFeaturesConfig<Multiselectable, Clears>,
    | 'rootApi'
    | 'planeApi'
    | 'disabledElementsReceiveFocus'
    | 'multiselectable'
    | 'clears'
  >>
)

type UseGridOptionsBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = {
  multiselectable?: Multiselectable,
  clears?: Clears,
  disabledOptionsReceiveFocus?: boolean,
  needsAriaOwns?: boolean, // TODO: support grid->(rowgroups or rows), rowgroup->rows
}

const defaultOptions: UseGridOptions<true, true> = {
  clears: true,
  disabledOptionsReceiveFocus: true,
  initialFocused: 'selected',
  initialSelected: { row: 0, column: 0 },
  initialStatus: 'focusing',
  initialSuperselectedFrom: 0,
  loops: false,
  multiselectable: true,
  needsAriaOwns: false,
  query: { matchThreshold: 1 },
  receivesFocus: true,
}

export function useGrid<
  Multiselectable extends boolean = true,
  Clears extends boolean = true
> (options: UseGridOptions<Multiselectable, Clears> = {}): Grid<Multiselectable> {
  // OPTIONS
  const {
    clears,
    disabledOptionsReceiveFocus,
    initialFocused,
    initialSelected,
    initialSuperselectedFrom,
    initialStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    query,
    receivesFocus,
  } = ({ ...defaultOptions, ...options } as UseGridOptions<Multiselectable, Clears>)


  // ELEMENTS
  const { root, keyboardTarget } = useRootAndKeyboardTarget({ defaultRootMeta: defaultLabelMeta }),
        rowgroups: Grid<true>['rowgroups'] = useListApi({ identifies: true }),
        rows: Grid<true>['rows'] = useListApi({ identifies: true }),
        cells: Grid<true>['cells'] = usePlaneApi({
          identifies: true,
          defaultMeta: {
            kind: 'cell',
            candidate: '',
            ability: 'enabled',
            span: { row: 1, column: 1 },
            ...defaultLabelMeta,
          },
        })


  // MULTIPLE CONCERNS
  const {
    focus,
    focused,
    select,
    selected,
    ...planeFeatures
  } = usePlaneFeatures({
    rootApi: root,
    keyboardTargetApi: keyboardTarget,
    planeApi: cells,
    clears,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    initialFocused,
    initialSelected,
    initialSuperselectedFrom,
    initialStatus,
    loops,
    multiselectable: multiselectable as true,
    query,
    receivesFocus,
  })


  // HISTORY
  const history: Grid<true>['history'] = useHistory()

  watch(
    () => history.entries.location,
    () => {
      const { focused, selected } = history.entries.item
      focus.exact(focused)
      select.exact(selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.value,
    selected: selected.value,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'grid',
      ...toLabelBindValues(root),
    }
  )

  bind(
    rowgroups.list,
    { role: 'rowgroup' }
  )

  bind(
    rows.list,
    {
      role: 'row',
      ...(
        needsAriaOwns
          ? {
            ariaOwns: {
              get: row => toTokenList(cells.ids.value[row]) as string,
              watchSource: cells.ids,
            },
          }
          : undefined
      ),
      // TODO: aria-disabled
    }
  )

  bind(
    cells.plane,
    {
      role: coordinates => {
        const { kind } = cells.meta.value.get(coordinates)

        return kind === 'cell'
          ? 'gridcell'
          : kind
      },
      ...toLabelBindValues(cells),
    }
  )


  // API
  return {
    root: {
      ...root,
      ref: meta => createMultiRef(
        root.ref(meta),
        keyboardTarget.ref(),
      ),
    },
    keyboardTarget,
    rowgroups,
    rows,
    cells,
    focused,
    focus,
    selected,
    select,
    history,
    ...planeFeatures,
  } as Grid<Multiselectable>
}
