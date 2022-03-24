import { computed, ComputedRef, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import type { MatchData } from 'fast-fuzzy'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  useListQuery,
  usePlaneState,
  usePopupTracking,
} from '../extracted'
import type {
  IdentifiedElementApi,
  IdentifiedPlaneApi,
  ListApi,
  History,
  UseHistoryOptions,
  ToEligibility,
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
  cells: IdentifiedPlaneApi<HTMLElement>,
  history: History<{
    focusedRow: Navigateable<HTMLElement[]>['location'],
    focusedColumn: Navigateable<HTMLElement>['location'],
    selectedRows: Pickable<HTMLElement[]>['picks'],
    selectedColumns: Pickable<HTMLElement>['picks'],
  }>,
} // & ReturnType<typeof useListQuery>

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
  toCandidate?: (element: HTMLElement, index: number) => string,
}

const defaultOptions: UseGridOptions<true, false> = {
  multiselectable: true,
  clearable: true,
  initialSelected: [0, 0],
  popup: false,
  initialPopupTracking: 'closed',
  hasRowheaders: false,
  hasColumnheaders: false,
  needsAriaOwns: false,
  selectsOnFocus: true,
  transfersFocus: true,
  loops: false,
  ability: () => 'enabled',
  disabledOptionsReceiveFocus: true,
  queryMatchThreshold: 1,
  toCandidate: element => element.textContent,
}

export function useGrid<Multiselectable extends boolean = false, Popup extends boolean = false> (options: UseGridOptions<Multiselectable, Popup> = {}): Grid<Multiselectable, Popup> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clearable,
    popup,
    initialPopupTracking,
    history: historyOptions,
    ability: abilityOption,
    needsAriaOwns,
    hasRowheaders,
    hasColumnheaders,
    loops,
    selectsOnFocus,
    transfersFocus,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
    toCandidate,
  } = ({ ...defaultOptions, ...options } as UseGridOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Grid<true, true>['root'] = useElementApi({ identified: true }),
        rowgroups: Grid<true, true>['rowgroups'] = useElementApi({ kind: 'list' }),
        rows: Grid<true, true>['rows'] = useElementApi({ kind: 'list' }),
        cells: Grid<true, true>['cells'] = useElementApi({ kind: 'plane', identified: true })


  // TODO: Probably usePlaneQuery
  // QUERY
  // const { query, searchable, type, paste, search } = useListQuery({ plane: cells, toCandidate })

  // if (transfersFocus) {
  //   on<'keydown'>(
  //     cells.elements,
  //     defineEffect => [
  //       defineEffect(
  //         'keydown',
  //         event => {
  //           if (
  //             (event.key.length === 1 || !/^[A-Z]/i.test(event.key))
  //             && !event.ctrlKey && !event.metaKey
  //           ) {
  //             event.preventDefault()
  
  //             if (query.value.length === 0 && event.key === ' ') {
  //               return
  //             }
              
  //             type(event.key)
  //             search()
  //           }
  //         }
  //       )
  //     ]
  //   )
  // }
  

  // MULTIPLE CONCERNS
  const { focusedRow, focusedColumn, focus, selectedRows, selectedColumns, select, deselect, is, getStatuses } = usePlaneState<true>({
    root,
    plane: cells,
    ability: abilityOption,
    initialSelected,
    multiselectable: multiselectable as true,
    clearable,
    popup,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    loops,
    // query,
  })


  // FOCUSED
  // if (transfersFocus) {
  //   watch(
  //     () => searchable.value.results,
  //     () => {
  //       const toEligibility: ToEligibility = index => {
  //               if (searchable.value.results.length === 0) {
  //                 return 'ineligible'
  //               }

  //               return (searchable.value.results[index] as MatchData<string>).score >= queryMatchThreshold ? 'eligible' : 'ineligible'
  //             }
        
  //       const ability = focus.next(focused.value.location, { toEligibility })
  //       if (ability === 'none' && !loops) {
  //         focus.first({ toEligibility })
  //       }
  //     }
  //   )
  // }

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
        (hasRowheaders && row === 0 && 'rowheader')
        || (hasColumnheaders && column === 0 && 'columnheader')
        || 'gridcell',
      id: (row, column) => cells.ids.value[row][column],
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
