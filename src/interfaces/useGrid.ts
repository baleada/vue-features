import { watch } from 'vue'
import { join } from 'lazy-collections'
import { bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  usePlaneFeatures,
  toLabelBindValues,
  defaultLabelMeta,
  usePlaneApi,
  useListApi,
} from '../extracted'
import type {
  ElementApi,
  ListApi,
  PlaneApi,
  History,
  PlaneFeatures,
  UsePlaneFeaturesConfig,
  LabelMeta,
  Ability,
  Coordinates,
} from '../extracted'

export type Grid<Multiselectable extends boolean = false> = (
  & GridBase
  & Omit<PlaneFeatures<Multiselectable>, 'getStatuses'>
  & { getCellStatuses: PlaneFeatures<Multiselectable>['getStatuses'] }
)

type GridBase = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
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
  beforeUpdate: () => void,
}

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
  initialSelected: [0, 0],
  initialStatus: 'focusing',
  loops: false,
  multiselectable: true,
  needsAriaOwns: false,
  queryMatchThreshold: 1,
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
    initialStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    queryMatchThreshold,
    receivesFocus,
  } = ({ ...defaultOptions, ...options } as UseGridOptions<Multiselectable, Clears>)


  // ELEMENTS
  const root: Grid<true>['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
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
    focusedRow,
    focusedColumn,
    focused,
    focus,
    query,
    results,
    type,
    paste,
    search,
    selectedRows,
    selectedColumns,
    selected,
    superselected,
    select,
    deselect,
    is,
    total,
    getStatuses,
  } = usePlaneFeatures({
    rootApi: root,
    planeApi: cells,
    clears,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    initialFocused,
    initialSelected,
    initialStatus,
    loops,
    multiselectable: multiselectable as true,
    needsAriaOwns,
    queryMatchThreshold,
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
  const toAriaOwns = join(' ')

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
              get: row => toAriaOwns(cells.ids.value[row]) as string,
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
      role: ([row, column]) => {
        const { kind } = cells.meta.value[row][column]

        return kind === 'cell'
          ? 'gridcell'
          : kind
      },
      ...toLabelBindValues(cells),
    }
  )


  // API
  return {
    root,
    rowgroups,
    rows,
    cells,
    focusedRow,
    focusedColumn,
    focused,
    focus,
    selectedRows,
    selectedColumns,
    selected,
    superselected,
    select,
    deselect,
    is,
    total,
    getCellStatuses: getStatuses,
    history,
    query,
    results,
    search,
    type,
    paste,
    beforeUpdate: () => {
      rowgroups.beforeUpdate()
      rows.beforeUpdate()
      cells.beforeUpdate()
    },
  } as unknown as Grid<Multiselectable>
}
