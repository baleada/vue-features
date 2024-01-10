import { computed, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
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
  ToPlaneEligibility,
  PlaneFeatures,
  UsePlaneFeaturesConfig,
  LabelMeta,
} from '../extracted'

export type Grid<Multiselectable extends boolean = false> = GridBase
  & Omit<PlaneFeatures<Multiselectable>, 'getStatuses'>
  & { getCellStatuses: PlaneFeatures<Multiselectable>['getStatuses'] }

type GridBase = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
  rowgroups: ListApi<HTMLElement, false>,
  rows: ListApi<HTMLElement, false>,
  cells: PlaneApi<
    HTMLElement,
    true,
    {
      candidate?: string,
      ability?: 'enabled' | 'disabled',
      rowSpan?: number,
      columnSpan?: number,
    } & LabelMeta
  >,
  history: History<{
    focusedRow: Navigateable<HTMLElement[]>['location'],
    focusedColumn: Navigateable<HTMLElement>['location'],
    selectedRows: Pickable<HTMLElement[]>['picks'],
    selectedColumns: Pickable<HTMLElement>['picks'],
  }>,
}

export type UseGridOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = UseGridOptionsBase<Multiselectable, Clears>
  & Partial<Omit<
    UsePlaneFeaturesConfig<Multiselectable, Clears>,
    | 'plane'
    | 'disabledElementsReceiveFocus'
    | 'multiselectable'
    | 'query'
    | 'clears'
  >>
  & {
    hasRowheaders?: boolean,
    hasColumnheaders?: boolean,
  }

type UseGridOptionsBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = {
  multiselectable?: Multiselectable,
  clears?: Clears,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseGridOptions<true, false> = {
  multiselectable: true,
  clears: false,
  initialSelected: [0, 0],
  hasRowheaders: false,
  hasColumnheaders: false,
  needsAriaOwns: false,
  selectsOnFocus: true,
  transfersFocus: true,
  loops: false,
  disabledOptionsReceiveFocus: true,
  queryMatchThreshold: 1,
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
    hasRowheaders,
    hasColumnheaders,
    loops,
    selectsOnFocus,
    transfersFocus,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
  } = ({ ...defaultOptions, ...options } as UseGridOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Grid<true>['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
        rowgroups: Grid<true>['rowgroups'] = useListApi(),
        rows: Grid<true>['rows'] = useListApi(),
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
  } = usePlaneFeatures({
    rootApi: root,
    planeApi: cells,
    initialSelected,
    multiselectable: multiselectable as true,
    clears,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    loops,
    queryMatchThreshold,
  })


  // FOCUSED
  if (transfersFocus) {
    watch(
      results,
      () => {
        const toEligibility: ToPlaneEligibility = ([row, column]) => {
          if (results.value.length === 0) return 'ineligible'

          return results.value[row][column].score >= queryMatchThreshold
            ? 'eligible'
            : 'ineligible'
        }
        
        for (let r = focusedRow.location; r < focusedRow.array.length; r++) {
          const ability = r === focusedRow.location
            ? focus.nextInRow([r, focusedColumn.location - 1], { toEligibility })
            : focus.firstInRow(r, { toEligibility })
          
          if (ability === 'enabled') break
          
          if (ability === 'none' && r === focusedRow.array.length - 1) {
            focus.first({ toEligibility })
          }
        }
      }
    )
  }

  bind(
    root.element,
    { tabindex: -1 },
  )


  // HISTORY
  const history: Grid<true>['history'] = useHistory()

  watch(
    () => history.entries.location,
    () => {
      const item = history.entries.item
      focusedRow.navigate(item.focusedRow)
      focusedColumn.navigate(item.focusedColumn)
      selectedRows.pick(item.selectedRows, { replace: 'all' })
      selectedColumns.pick(item.selectedColumns, { replace: 'all' })
    },
  )

  history.record({
    focusedRow: focusedRow.location,
    focusedColumn: focusedColumn.location,
    selectedRows: selectedRows.picks,
    selectedColumns: selectedColumns.picks,
  })
  

  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'grid',
      ...toLabelBindValues(root),
      // TODO:
      // ariaMultiselectable: () => multiselectable || undefined,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => cells.ids.value.join(' '))
        }
      })(),
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
      // TODO: aria-disabled
    }
  )

  bind(
    cells.plane,
    {
      role: ([row, column]) => 
        (hasRowheaders && hasColumnheaders && column === 0 && row === 0 && undefined)
        || (hasRowheaders && column === 0 && 'rowheader')
        || (hasColumnheaders && row === 0 && 'columnheader')
        || 'gridcell',
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
  } as unknown as Grid<Multiselectable>
}
