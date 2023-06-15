import { onMounted, watch, watchPostEffect, nextTick } from 'vue'
import type { Ref } from 'vue'
import { find, findIndex } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { Pickable } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import type { IdentifiedElementApi, IdentifiedPlaneApi } from './useElementApi'
import { createEligibleInPlaneNavigation } from './createEligibleInPlaneNavigation'
import { createEligibleInPlanePicking } from './createEligibleInPlanePicking'
import { planeOn } from './planeOn'

export type PlaneState<Multiselectable extends boolean = false> = Multiselectable extends true
  ? PlaneStateBase & {
    select: ReturnType<typeof createEligibleInPlanePicking>,
    deselect: (rowOrRows: number | number[], columnOrColumns: number | number[]) => void,
  }
  : PlaneStateBase & {
    select: Omit<ReturnType<typeof createEligibleInPlanePicking>, 'exact'> & { exact: (row: number, column: number) => void },
    deselect: () => void,
  }

type PlaneStateBase = {
  focusedRow: Ref<Navigateable<HTMLElement[]>>,
  focusedColumn: Ref<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createEligibleInPlaneNavigation>,
  selectedRows: Ref<Pickable<HTMLElement[]>>,
  selectedColumns: Ref<Pickable<HTMLElement>>,
  is: {
    focused: (row: number, column: number) => boolean,
    selected: (row: number, column: number) => boolean,
    enabled: (row: number, column: number) => boolean,
    disabled: (row: number, column: number) => boolean,
  }
  getStatuses: (row: number, column: number) => ['focused' | 'blurred', 'selected' | 'deselected', 'enabled' | 'disabled'],
}

export type UsePlaneStateConfig<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' },
> = Multiselectable extends true
  ? UsePlaneStateConfigBase<Multiselectable, Meta> & {
    // TODO: Support none and all
    initialSelected?: [row: number, column: number] | [row: number, column: number][] | 'none' | 'all',
  }
  : UsePlaneStateConfigBase<Multiselectable, Meta> & {
    initialSelected?: [row: number, column: number] | 'none',
  }

type UsePlaneStateConfigBase<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' },
> = {
  root: IdentifiedElementApi<HTMLElement>,
  plane: IdentifiedPlaneApi<HTMLElement, Meta>,
  multiselectable: Multiselectable,
  clears: boolean,
  popup: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function usePlaneState<Multiselectable extends boolean = false> (
  {
    root,
    plane,
    initialSelected,
    multiselectable,
    clears,
    popup,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus,
    loops,
    query,
  }: UsePlaneStateConfig<Multiselectable>
) {
  // ABILITY
  bind(
    plane.elements,
    {
      ariaDisabled: (row, column) => plane.meta.value?.[row]?.[column]?.ability === 'disabled'
        ? true
        : undefined,
    },
  )


  // FOCUSED
  const focusedRow: PlaneState<true>['focusedRow'] = useNavigateable(plane.elements.value),
        focusedColumn: PlaneState<true>['focusedColumn'] = useNavigateable(plane.elements.value[0] || []),
        focus: PlaneState<true>['focus'] = createEligibleInPlaneNavigation({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          rows: focusedRow,
          columns: focusedColumn,
          loops,
          plane,
        }),
        predicateFocused: PlaneState<true>['is']['focused'] = (row, column) =>
          focusedRow.value.location === row && focusedColumn.value.location === column

  onMounted(() => {
    watchPostEffect(() => {
      focusedRow.value.array = plane.elements.value
      focusedColumn.value.array = plane.elements.value[0]
    })

    const [initialFocusedRow, initialFocusedColumn] = (() => {
      if (Array.isArray(initialSelected) && Array.isArray(initialSelected[0])) {
        if (initialSelected[0].length > 0) {
          return initialSelected[initialSelected.length - 1] as [row: number, column: number]
        }

        return [0, 0]
      }

      if (Array.isArray(initialSelected)) {
        return initialSelected as [row: number, column: number]
      }

      return [0, 0]
    })()

    // Account for conditional rendering
    const stop = watch(
      () => focusedRow.value.array,
      () => {
        // Storage extensions might have already set location
        if (focusedRow.value.location !== 0 && focusedColumn.value.location !== 0) {
          nextTick(stop)
          return
        }

        if (focusedRow.value.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            focusedRow.value.navigate(initialFocusedRow)
            focusedColumn.value.navigate(initialFocusedColumn)
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )

    if (transfersFocus) {
      watch(
        [() => focusedRow.value.location, () => focusedColumn.value.location],
        () => {
          if (plane.elements.value[focusedRow.value.location][focusedColumn.value.location] === document.activeElement) {
            return
          }
          
          plane.elements.value[focusedRow.value.location]?.[focusedColumn.value.location]?.focus()
        },
        { flush: 'post' }
      )
    }
  })

  if (transfersFocus){
    bind(
      plane.elements,
      {
        tabindex: {
          get: (row, column) => row === focusedRow.value.location && column === focusedColumn.value.location ? 0 : -1,
          watchSource: [() => focusedRow.value.location, () => focusedColumn.value.location],
        },
      }
    )
  }


  // SELECTED
  const selectedRows: PlaneState<true>['selectedRows'] = usePickable(plane.elements.value),
        selectedColumns: PlaneState<true>['selectedColumns'] = usePickable(plane.elements.value[0] || []),
        select: PlaneState<true>['select'] = createEligibleInPlanePicking({
          rows: selectedRows,
          columns: selectedColumns,
          plane,
        }),
        deselect: PlaneState<true>['deselect'] = (rowOrRows, columnOrColumns) => {
          const narrowedRows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows],
                narrowedColumns = Array.isArray(columnOrColumns) ? columnOrColumns : [columnOrColumns],
                omits: number[] = []

          for (let row = 0; row < narrowedRows.length; row++) {
            for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
              if (
                selectedRows.value.picks[rowPick] === narrowedRows[row]
                && selectedColumns.value.picks[rowPick] === narrowedColumns[row]
              ) {
                omits.push(rowPick)
              }
            }
          }

          if (!clears) {
            if (omits.length === selectedRows.value.picks.length) {
              return
            }
          }

          if (omits.length > 0) {
            selectedRows.value.omit(omits, { reference: 'picks' })
            selectedColumns.value.omit(omits, { reference: 'picks' })
          }
        },
        predicateSelected: PlaneState<true>['is']['selected'] = (row, column) => {
          for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
            if (
              selectedRows.value.picks[rowPick] === row
              && selectedColumns.value.picks[rowPick] === column
            ) {
              return true
            }
          }
          
          return false
        },
        preventSelectOnFocus = () => multiselectionStatus = 'selecting',
        allowSelectOnFocus = () => nextTick(() => multiselectionStatus = 'selected')

  let multiselectionStatus: 'selected' | 'selecting' = 'selected'

  if (selectsOnFocus) {
    watch(
      [() => focusedRow.value.location, () => focusedColumn.value.location],
      () => {
        if (multiselectionStatus === 'selecting') return
        select.exact(focusedRow.value.location, focusedColumn.value.location, { replace: 'all' })
      }
    )
  }

  onMounted(() => {
    watchPostEffect(() => {
      selectedRows.value.array = plane.elements.value
      selectedColumns.value.array = plane.elements.value[0]
    })

    const [initialSelectedRows, initialSelectedColumns] = (() => {
      const coordinates = (() => {
        if (Array.isArray(initialSelected) && Array.isArray(initialSelected[0])) {
          return initialSelected as [row: number, column: number][]
        }

        if (Array.isArray(initialSelected)) {
          return [initialSelected] as [row: number, column: number][]
        }
  
        return [] as [row: number, column: number][]
      })()

      const initialSelectedRows: number[] = [],
            initialSelectedColumns: number[] = []
      
      for (const pair of coordinates) {
        initialSelectedRows.push(pair[0])
        initialSelectedColumns.push(pair[1])
      }

      return [initialSelectedRows, initialSelectedColumns]
    })()

    // Account for conditional rendering
    const stop = watch(
      () => selectedRows.value.array,
      () => {
        // Storage extensions might have already set picks
        if (selectedRows.value.picks.length > 0) {
          nextTick(stop)
          return
        }

        if (selectedRows.value.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            selectedRows.value.pick(initialSelectedRows)
            selectedColumns.value.pick(initialSelectedColumns)
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )
  })

  bind(
    plane.elements,
    {
      ariaSelected: {
        get: (row, column) => predicateSelected(row, column) ? 'true' : undefined,
        watchSource: [() => selectedRows.value.picks, () => selectedColumns.value.picks],
      },
    }
  )


  // MULTIPLE CONCERNS
  const getStatuses: PlaneState<true>['getStatuses'] = (row, column) => {
    return [
      predicateFocused(row, column) ? 'focused' : 'blurred',
      predicateSelected(row, column) ? 'selected' : 'deselected',
      plane.meta.value[row][column].ability,
    ]
  }

  if (transfersFocus) {
    planeOn({
      keyboardElement: root.element,
      pointerElement: root.element,
      getRow: id => findIndex<string[]>(row =>
        !!(find<string>(i => i === id)(row) as string)
      )(plane.ids.value) as number,
      getColumn: (id, row) => findIndex<string>(i => i === id)(plane.ids.value[row]) as number,
      focus,
      focusedRow,
      focusedColumn,
      select: {
        ...select,
        exact: multiselectable ? select.exact : (row, column) => select.exact(row, column, { replace: 'all' })
      },
      selectedRows,
      selectedColumns,
      deselect: multiselectable ? deselect : () => (deselect as PlaneState<false>['deselect'])(),
      predicateSelected,
      preventSelectOnFocus,
      allowSelectOnFocus,
      multiselectable,
      selectsOnFocus,
      clears,
      popup,
      query,
      getAbility: (row, column) => plane.meta.value[row]?.[column]?.ability || 'enabled',
    })
  }
  

  // API
  return {
    focusedRow,
    focusedColumn,
    focus,
    selectedRows,
    selectedColumns,
    select: {
      ...select,
      exact: multiselectable ? select.exact : (row, column) => select.exact(row, column, { replace: 'all' })
    },
    deselect: multiselectable ? deselect : () => (deselect as PlaneState<false>['deselect'])(),
    is: {
      focused: (row, column) => predicateFocused(row, column),
      selected: (row, column) => predicateSelected(row, column),
      enabled: (row, column) => plane.meta.value?.[row]?.[column]?.ability === 'enabled',
      disabled: (row, column) => plane.meta.value?.[row]?.[column]?.ability === 'disabled',
    },
    getStatuses,
  } as PlaneState<Multiselectable>
}
