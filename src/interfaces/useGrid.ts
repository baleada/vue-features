import type { ComputedRef } from 'vue'
import { computed, watch } from 'vue'
import { find } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  usePlaneQuery,
  usePlaneState,
  usePopup,
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
  Popup,
  UsePopupOptions,
} from '../extracted'

export type Grid<Multiselectable extends boolean = false, PopsUp extends boolean = false> = GridBase
  & Omit<PlaneState<Multiselectable>, 'is' | 'getStatuses'>
  & { getOptionStatuses: PlaneState<Multiselectable>['getStatuses'] }
  & (
    PopsUp extends true
      ? {
        is: PlaneState<Multiselectable>['is'] & Popup['is'],
        status: ComputedRef<Popup['status']['value']>
      } & Omit<Popup, 'is' | 'status'>
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

export type UseGridOptions<Multiselectable extends boolean = false, PopsUp extends boolean = false> = UseGridOptionsBase<Multiselectable, PopsUp>
  & Partial<Omit<UsePlaneStateConfig<Multiselectable>, 'plane' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
  & {
    initialPopupStatus?: UsePopupOptions['initialStatus'],
    hasRowheaders?: boolean,
    hasColumnheaders?: boolean,
  }

type UseGridOptionsBase<Multiselectable extends boolean = false, PopsUp extends boolean = false> = {
  multiselectable?: Multiselectable,
  popsUp?: PopsUp,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseGridOptions<true, false> = {
  multiselectable: true,
  clears: false,
  initialSelected: [0, 0],
  popsUp: false,
  initialPopupStatus: 'closed',
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
  PopsUp extends boolean = false
> (options: UseGridOptions<Multiselectable, PopsUp> = {}): Grid<Multiselectable, PopsUp> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clears,
    popsUp,
    initialPopupStatus,
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
  const root: Grid<true, true>['root'] = useElementApi({ identifies: true }),
        rowgroups: Grid<true, true>['rowgroups'] = useElementApi({ kind: 'list' }),
        rows: Grid<true, true>['rows'] = useElementApi({ kind: 'list' }),
        cells: Grid<true, true>['cells'] = useElementApi({
          kind: 'plane',
          identifies: true,
          defaultMeta: { candidate: '', ability: 'enabled', rowSpan: 1, columnSpan: 1 },
        })


  // QUERY
  // TODO: paste?
  const { query, results, type, search } = usePlaneQuery({ plane: cells })

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
        },
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
    popsUp,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    loops,
    // query,
  })


  // FOCUSED
  if (transfersFocus) {
    watch(
      results,
      () => {
        const toEligibility: ToPlaneEligibility = (row, column) => {
                if (results.value.length === 0) {
                  return 'ineligible'
                }

                const result = find<MatchData<{ row: number, column: number, candidate: string }>>(
                  ({ item: { row: r, column: c } }) => r === row && c === column,
                )(results.value) as typeof results.value[number]

                return result.score >= queryMatchThreshold
                  ? 'eligible'
                  : 'ineligible'
              }
        
        for (let r = focusedRow.location; r < focusedRow.array.length; r++) {
          const ability = r === focusedRow.location
            ? focus.nextInRow(r, focusedColumn.location - 1, { toEligibility })
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
  const popup = usePopup({ initialStatus: initialPopupStatus })


  // HISTORY
  const history: Grid<true, true>['history'] = useHistory(historyOptions)

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
  if (popsUp) {
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
      open: () => popup.open(),
      close: () => popup.close(),
      is: {
        ...is,
        ...popup.is,
      },
      status: computed(() => popup.status.value),
      getOptionStatuses: getStatuses,
      history,
      // query: computed(() => query.value),
      // results,
      // search,
      // type,
      // paste,
    } as unknown as Grid<Multiselectable, PopsUp>
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
    // results,
    // search,
    // type,
    // paste,
  } as unknown as Grid<Multiselectable, PopsUp>
}
