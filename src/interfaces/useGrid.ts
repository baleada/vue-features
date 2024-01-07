import type { ComputedRef } from 'vue'
import { computed, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  usePlaneQuery,
  usePlaneFeatures,
  usePopup,
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
  Popup,
  UsePopupOptions,
  LabelMeta,
} from '../extracted'

export type Grid<
  Multiselectable extends boolean = false,
  PopsUp extends boolean = false
> = GridBase
  & Omit<PlaneFeatures<Multiselectable>, 'is' | 'getStatuses'>
  & { getCellStatuses: PlaneFeatures<Multiselectable>['getStatuses'] }
  & (
    PopsUp extends true
      ? {
        is: PlaneFeatures<Multiselectable>['is'] & Popup['is'],
        status: ComputedRef<Popup['status']['value']>
      } & Omit<Popup, 'is' | 'status'>
      : {
        is: PlaneFeatures<Multiselectable>['is'],
      }
  )

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
} & ReturnType<typeof usePlaneQuery>

export type UseGridOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  PopsUp extends boolean = false
> = UseGridOptionsBase<Multiselectable, Clears, PopsUp>
  & Partial<Omit<
    UsePlaneFeaturesConfig<Multiselectable, Clears>,
    | 'plane'
    | 'disabledElementsReceiveFocus'
    | 'multiselectable'
    | 'query'
    | 'clears'
  >>
  & {
    initialPopupStatus?: UsePopupOptions['initialStatus'],
    hasRowheaders?: boolean,
    hasColumnheaders?: boolean,
  }

type UseGridOptionsBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  PopsUp extends boolean = false
> = {
  multiselectable?: Multiselectable,
  clears?: Clears,
  popsUp?: PopsUp,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseGridOptions<true, false, false> = {
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
  Clears extends boolean = false,
  PopsUp extends boolean = false
> (options: UseGridOptions<Multiselectable, Clears, PopsUp> = {}): Grid<Multiselectable, PopsUp> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clears,
    popsUp,
    initialPopupStatus,
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
  const root: Grid<true, true>['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
        rowgroups: Grid<true, true>['rowgroups'] = useListApi(),
        rows: Grid<true, true>['rows'] = useListApi(),
        cells: Grid<true, true>['cells'] = usePlaneApi({
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
  const { focusedRow, focusedColumn, focused, focus, selectedRows, selectedColumns, selected, select, deselect, is, getStatuses } = usePlaneFeatures({
          rootApi: root,
          planeApi: cells,
          initialSelected,
          multiselectable: multiselectable as true,
          clears,
          popsUp,
          selectsOnFocus,
          transfersFocus,
          disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
          loops,
          predicateIsTypingQuery: () => false,
        }),
        { query, results, type, paste, search } = usePlaneQuery({
          rootApi: root,
          planeApi: cells,
          transfersFocus,
          loops,
          queryMatchThreshold,
          focus,
          focusedRow,
          focusedColumn,
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

  // TODO: Expected behavior here? Different from selectsOnFocus with keyboard
  // on<IdentifiedPlaneApi<HTMLElement>['elements'], 'mouseenter'>(
  //   cells.elements,
  //   defineEffect => [
  //     defineEffect(
  //       'mouseenter',
  //       {
  //         createEffect: ([row, column]) => () => {
  //           if (selectsOnFocus) {
  //             return
  //           }

  //           focus.exact([row, column])
  //         }
  //       }
  //     )
  //   ]
  // )


  // POPUP STATUS
  const popup = usePopup({ initialStatus: initialPopupStatus })


  // HISTORY
  const history: Grid<true, true>['history'] = useHistory()

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
      getCellStatuses: getStatuses,
      history,
      query: computed(() => query.value),
      results,
      search,
      type,
      paste,
    } as unknown as Grid<Multiselectable, PopsUp>
  }

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
    query: computed(() => query.value),
    results,
    search,
    type,
    paste,
  } as unknown as Grid<Multiselectable, PopsUp>
}
