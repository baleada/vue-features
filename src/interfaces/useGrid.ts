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
      ability?: 'enabled' | 'disabled',
      rowSpan?: number,
      columnSpan?: number,
      kind?: 'cell' | 'rowheader' | 'columnheader',
    } & LabelMeta
  >,
  history: History<{
    focused: [row: number, column: number],
    selected: [row: number, column: number][],
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

const defaultOptions: UseGridOptions<true, false> = {
  clears: false,
  disabledOptionsReceiveFocus: true,
  initialSelected: [0, 0],
  loops: false,
  multiselectable: true,
  needsAriaOwns: false,
  queryMatchThreshold: 1,
  selectsOnFocus: true,
  receivesFocus: true,
}

export function useGrid<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> (options: UseGridOptions<Multiselectable, Clears> = {}): Grid<Multiselectable> {
  // OPTIONS
  const {
          initialSelected,
          multiselectable,
          clears,
          needsAriaOwns,
          loops,
          selectsOnFocus,
          receivesFocus,
          disabledOptionsReceiveFocus,
          queryMatchThreshold,
        } = ({ ...defaultOptions, ...options } as UseGridOptions<Multiselectable>)

  
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
            candidate: '',
            ability: 'enabled',
            rowSpan: 1,
            columnSpan: 1,
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
    select,
    deselect,
    is,
    getStatuses,
  } = usePlaneFeatures<true>({
    rootApi: root,
    planeApi: cells,
    clears,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    initialSelected,
    loops,
    multiselectable: multiselectable as true,
    queryMatchThreshold,
    selectsOnFocus,
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
    select,
    deselect,
    is,
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
