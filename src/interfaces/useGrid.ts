import { computed, ComputedRef, watch } from 'vue'
import { find } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  usePlaneQuery,
  usePlaneState,
  usePopupTracking,
} from '../extracted'
import type {
  IdentifiedElementApi,
  IdentifiedPlaneApi,
  ListApi,
  History,
  UseHistoryOptions,
  ToPlaneEligibility,
  PlaneState,
  UsePlaneStateConfig,
  PopupTracking,
  UsePopupTrackingOptions,
} from '../extracted'

export type Grid<Multiselectable extends boolean = false, Popup extends boolean = false> = GridBase
  & Omit<PlaneState<Multiselectable>, 'is' | 'getStatuses'>
  & { getOptionStatuses: PlaneState<Multiselectable>['getStatuses'] }
  & (
    Popup extends true
      ? {
        is: PlaneState<Multiselectable>['is'] & PopupTracking['is'],
        status: ComputedRef<PopupTracking['status']['value']>
      } & Omit<PopupTracking, 'is' | 'status'>
      : {
        is: PlaneState<Multiselectable>['is'],
      }
  )

type GridBase = {
  root: IdentifiedElementApi<HTMLElement>,
  rowgroups: ListApi<HTMLElement>,
  rows: ListApi<HTMLElement>,
  cells: IdentifiedPlaneApi<
    HTMLElement,
    { candidate: string, ability: 'enabled' | 'disabled', rowSpan: number, columnSpan: number }
  >,
  history: History<{
    focusedRow: Navigateable<HTMLElement[]>['location'],
    focusedColumn: Navigateable<HTMLElement>['location'],
    selectedRows: Pickable<HTMLElement[]>['picks'],
    selectedColumns: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof usePlaneQuery>

export type UseGridOptions<Multiselectable extends boolean = false, Popup extends boolean = false> = UseGridOptionsBase<Multiselectable, Popup>
  & Partial<Omit<UsePlaneStateConfig<Multiselectable>, 'plane' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
  & {
    initialPopupTracking?: UsePopupTrackingOptions['initialStatus'],
    hasRowheaders?: boolean,
    hasColumnheaders?: boolean,
  }

type UseGridOptionsBase<Multiselectable extends boolean = false, Popup extends boolean = false> = {
  multiselectable?: Multiselectable,
  popup?: Popup,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseGridOptions<true, false> = {
  multiselectable: true,
  clears: false,
  initialSelected: [0, 0],
  popup: false,
  initialPopupTracking: 'closed',
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
  Popup extends boolean = false
> (options: UseGridOptions<Multiselectable, Popup> = {}): Grid<Multiselectable, Popup> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clears,
    popup,
    initialPopupTracking,
    history: historyOptions,
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
  const root: Grid<true, true>['root'] = useElementApi({ identified: true }),
        rowgroups: Grid<true, true>['rowgroups'] = useElementApi({ kind: 'list' }),
        rows: Grid<true, true>['rows'] = useElementApi({ kind: 'list' }),
        cells: Grid<true, true>['cells'] = useElementApi({
          kind: 'plane',
          identified: true,
          defaultMeta: { candidate: '', ability: 'enabled', rowSpan: 1, columnSpan: 1 },
        })


  // QUERY
  const { query, searchable, type, paste, search } = usePlaneQuery({ plane: cells })

  if (transfersFocus) {
    on(
      root.element,
      {
        keydown: event => {
          if (
            (event.key.length === 1 || !/^[A-Z]/i.test(event.key))
            && !event.ctrlKey && !event.metaKey
          ) {
            event.preventDefault()

            if (query.value.length === 0 && event.key === ' ') {
              return
            }
            
            type(event.key)
            search()
          }
        }
      }
    )
  }
  

  // MULTIPLE CONCERNS
  const { focusedRow, focusedColumn, focus, selectedRows, selectedColumns, select, deselect, is, getStatuses } = usePlaneState<true>({
    root,
    plane: cells,
    initialSelected,
    multiselectable: multiselectable as true,
    clears,
    popup,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    loops,
    // query,
  })


  // FOCUSED
  if (transfersFocus) {
    watch(
      () => searchable.value.results,
      () => {
        const toEligibility: ToPlaneEligibility = (row, column) => {
                if (searchable.value.results.length === 0) {
                  return 'ineligible'
                }

                const result = find<MatchData<{ row: number, column: number, candidate: string }>>(
                  ({ item: { row: r, column: c } }) => r === row && c === column,
                )(
                  searchable.value.results as MatchData<{ row: number, column: number, candidate: string }>[]
                ) as MatchData<{ row: number, column: number, candidate: string }>

                return result.score >= queryMatchThreshold
                  ? 'eligible'
                  : 'ineligible'
              }
        
        for (let r = focusedRow.value.location; r < focusedRow.value.array.length; r++) {
          const ability = r === focusedRow.value.location
            ? focus.nextInRow(r, focusedColumn.value.location - 1, { toEligibility })
            : focus.firstInRow(r, { toEligibility })
          
          if (ability === 'enabled') break
          
          if (ability === 'none' && r === focusedRow.value.array.length - 1) {
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

  // TODO: Expected behavior here? Different from selectsOnFocus with keyboard
  // on<IdentifiedPlaneApi<HTMLElement>['elements'], 'mouseenter'>(
  //   cells.elements,
  //   defineEffect => [
  //     defineEffect(
  //       'mouseenter',
  //       {
  //         createEffect: (row, column) => () => {
  //           if (selectsOnFocus) {
  //             return
  //           }

  //           focus.exact(row, column)
  //         }
  //       }
  //     )
  //   ]
  // )


  // POPUP STATUS
  const popupTracking = usePopupTracking({ initialStatus: initialPopupTracking })


  // HISTORY
  const history: Grid<true, true>['history'] = useHistory(historyOptions)

  watch(
    () => history.entries.value.location,
    () => {
      const item = history.entries.value.item
      focusedRow.value.navigate(item.focusedRow)
      focusedColumn.value.navigate(item.focusedColumn)
      selectedRows.value.pick(item.selectedRows, { replace: 'all' })
      selectedColumns.value.pick(item.selectedColumns, { replace: 'all' })
    },
  )

  history.record({
    focusedRow: focusedRow.value.location,
    focusedColumn: focusedColumn.value.location,
    selectedRows: selectedRows.value.picks,
    selectedColumns: selectedColumns.value.picks,
  })
  

  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'grid',
      // TODO:
      // ariaMultiselectable: () => multiselectable || undefined,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => cells.ids.value.join(' '))
        }
      })()
    }
  )

  bind(
    rowgroups.elements,
    { role: 'rowgroup' }
  )

  bind(
    rows.elements,
    {
      role: 'row',
      // TODO: aria-disabled
    }
  )

  bind(
    cells.elements,
    {
      role: (row, column) => 
        (hasRowheaders && hasColumnheaders && column === 0 && row === 0 && undefined)
        || (hasRowheaders && column === 0 && 'rowheader')
        || (hasColumnheaders && row === 0 && 'columnheader')
        || 'gridcell',
      id: (row, column) => cells.ids.value[row]?.[column],
    }
  )


  // API
  if (popup) {
    return {
      root,
      rowgroups,
      rows,
      cells,
      focusedRow,
      focusedColumn,
      focus,
      selectedRows,
      selectedColumns,
      select,
      deselect,
      open: () => popupTracking.open(),
      close: () => popupTracking.close(),
      is: {
        ...is,
        ...popupTracking.is,
      },
      status: computed(() => popupTracking.status.value),
      getOptionStatuses: getStatuses,
      history,
      // query: computed(() => query.value),
      // searchable,
      // search,
      // type,
      // paste,
    } as unknown as Grid<Multiselectable, Popup>
  }

  return {
    root,
    rowgroups,
    rows,
    cells,
    focusedRow,
    focusedColumn,
    focus,
    selectedRows,
    selectedColumns,
    select,
    deselect,
    is,
    getOptionStatuses: getStatuses,
    history,
    // query: computed(() => query.value),
    // searchable,
    // search,
    // type,
    // paste,
  } as unknown as Grid<Multiselectable, Popup>
}
