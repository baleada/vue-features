import { onMounted, watch, watchPostEffect, nextTick } from 'vue'
import type { Ref, ShallowReactive } from 'vue'
import { find, findIndex } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import type { Pickable } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { PlaneApi } from './usePlaneApi'
import { createEligibleInPlaneNavigateApi } from './createEligibleInPlaneNavigateApi'
import { createEligibleInPlanePickApi } from './createEligibleInPlanePickApi'
import { planeOn } from './planeOn'

export type PlaneFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? PlaneFeaturesBase & {
    select: ReturnType<typeof createEligibleInPlanePickApi>,
    deselect: (rowOrRows: number | number[], columnOrColumns: number | number[]) => void,
  }
  : PlaneFeaturesBase & {
    select: Omit<ReturnType<typeof createEligibleInPlanePickApi>, 'exact'> & { exact: (row: number, column: number) => void },
    deselect: () => void,
  }

type PlaneFeaturesBase = {
  focusedRow: ShallowReactive<Navigateable<HTMLElement[]>>,
  focusedColumn: ShallowReactive<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createEligibleInPlaneNavigateApi>,
  selectedRows: ShallowReactive<Pickable<HTMLElement[]>>,
  selectedColumns: ShallowReactive<Pickable<HTMLElement>>,
  is: {
    focused: (row: number, column: number) => boolean,
    selected: (row: number, column: number) => boolean,
    enabled: (row: number, column: number) => boolean,
    disabled: (row: number, column: number) => boolean,
  }
  getStatuses: (row: number, column: number) => ['focused' | 'blurred', 'selected' | 'deselected', 'enabled' | 'disabled'],
}

export type UsePlaneFeaturesConfig<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' }
> = Multiselectable extends true
  ? UsePlaneFeaturesConfigBase<Multiselectable, Meta> & {
    // TODO: Support none and all
    initialSelected?: [row: number, column: number] | [row: number, column: number][] | 'none' | 'all',
  }
  : UsePlaneFeaturesConfigBase<Multiselectable, Meta> & {
    initialSelected?: [row: number, column: number] | 'none',
  }

type UsePlaneFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' }
> = {
  rootApi: ElementApi<HTMLElement, true>,
  planeApi: PlaneApi<HTMLElement, true, Meta>,
  multiselectable: Multiselectable,
  clears: boolean,
  popsUp: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function usePlaneFeatures<Multiselectable extends boolean = false> (
  {
    rootApi: rootApi,
    planeApi: planeApi,
    initialSelected,
    multiselectable,
    clears,
    popsUp,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus,
    loops,
    query,
  }: UsePlaneFeaturesConfig<Multiselectable>
) {
  // ABILITY
  bind(
    planeApi.plane,
    {
      ariaDisabled: (row, column) => planeApi.meta.value[row][column].ability === 'disabled'
        ? true
        : undefined,
    },
  )


  // FOCUSED
  const focusedRow: PlaneFeatures<true>['focusedRow'] = useNavigateable(planeApi.plane.value),
        focusedColumn: PlaneFeatures<true>['focusedColumn'] = useNavigateable(planeApi.plane.value[0] || []),
        focus: PlaneFeatures<true>['focus'] = createEligibleInPlaneNavigateApi({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          rows: focusedRow,
          columns: focusedColumn,
          loops,
          api: planeApi,
        }),
        predicateFocused: PlaneFeatures<true>['is']['focused'] = (row, column) =>
          focusedRow.location === row && focusedColumn.location === column

  onMounted(() => {
    watchPostEffect(() => {
      focusedRow.array = planeApi.plane.value
      focusedColumn.array = planeApi.plane.value[0]
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
      () => focusedRow.array,
      () => {
        // Storage extensions might have already set location
        if (focusedRow.location !== 0 && focusedColumn.location !== 0) {
          nextTick(stop)
          return
        }

        if (focusedRow.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            focusedRow.navigate(initialFocusedRow)
            focusedColumn.navigate(initialFocusedColumn)
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )

    if (transfersFocus) {
      watch(
        [() => focusedRow.location, () => focusedColumn.location],
        () => {
          if (planeApi.plane.value[focusedRow.location][focusedColumn.location] === document.activeElement) {
            return
          }
          
          planeApi.plane.value[focusedRow.location]?.[focusedColumn.location]?.focus()
        },
        { flush: 'post' }
      )
    }
  })

  if (transfersFocus){
    bind(
      planeApi.plane,
      {
        tabindex: {
          get: (row, column) => row === focusedRow.location && column === focusedColumn.location ? 0 : -1,
          watchSource: [() => focusedRow.location, () => focusedColumn.location],
        },
      }
    )
  }


  // SELECTED
  const selectedRows: PlaneFeatures<true>['selectedRows'] = usePickable(planeApi.plane.value),
        selectedColumns: PlaneFeatures<true>['selectedColumns'] = usePickable(planeApi.plane.value[0] || []),
        select: PlaneFeatures<true>['select'] = createEligibleInPlanePickApi({
          rows: selectedRows,
          columns: selectedColumns,
          api: planeApi,
        }),
        deselect: PlaneFeatures<true>['deselect'] = (rowOrRows, columnOrColumns) => {
          const narrowedRows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows],
                narrowedColumns = Array.isArray(columnOrColumns) ? columnOrColumns : [columnOrColumns],
                omits: number[] = []

          for (let row = 0; row < narrowedRows.length; row++) {
            for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
              if (
                selectedRows.picks[rowPick] === narrowedRows[row]
                && selectedColumns.picks[rowPick] === narrowedColumns[row]
              ) {
                omits.push(rowPick)
              }
            }
          }

          if (!clears) {
            if (omits.length === selectedRows.picks.length) {
              return
            }
          }

          if (omits.length > 0) {
            selectedRows.omit(omits, { reference: 'picks' })
            selectedColumns.omit(omits, { reference: 'picks' })
          }
        },
        predicateSelected: PlaneFeatures<true>['is']['selected'] = (row, column) => {
          for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
            if (
              selectedRows.picks[rowPick] === row
              && selectedColumns.picks[rowPick] === column
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
      [() => focusedRow.location, () => focusedColumn.location],
      () => {
        if (multiselectionStatus === 'selecting') return
        select.exact(focusedRow.location, focusedColumn.location, { replace: 'all' })
      }
    )
  }

  onMounted(() => {
    watchPostEffect(() => {
      selectedRows.array = planeApi.plane.value
      selectedColumns.array = planeApi.plane.value[0]
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
      () => selectedRows.array,
      () => {
        // Storage extensions might have already set picks
        if (selectedRows.picks.length > 0) {
          nextTick(stop)
          return
        }

        if (selectedRows.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            selectedRows.pick(initialSelectedRows)
            selectedColumns.pick(initialSelectedColumns)
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )
  })

  bind(
    planeApi.plane,
    {
      ariaSelected: {
        get: (row, column) => predicateSelected(row, column) ? 'true' : undefined,
        watchSource: [() => selectedRows.picks, () => selectedColumns.picks],
      },
    }
  )


  // MULTIPLE CONCERNS
  const getStatuses: PlaneFeatures<true>['getStatuses'] = (row, column) => {
    return [
      predicateFocused(row, column) ? 'focused' : 'blurred',
      predicateSelected(row, column) ? 'selected' : 'deselected',
      planeApi.meta.value[row][column].ability,
    ]
  }

  if (transfersFocus) {
    planeOn({
      keyboardElementApi: rootApi.element,
      pointerElementApi: rootApi.element,
      getRow: id => findIndex<string[]>(row =>
        !!(find<string>(i => i === id)(row) as string)
      )(planeApi.ids.value) as number,
      getColumn: (id, row) => findIndex<string>(i => i === id)(planeApi.ids.value[row]) as number,
      focus,
      focusedRow,
      focusedColumn,
      select: {
        ...select,
        exact: multiselectable ? select.exact : (row, column) => select.exact(row, column, { replace: 'all' }),
      },
      selectedRows,
      selectedColumns,
      deselect: multiselectable ? deselect : () => (deselect as PlaneFeatures<false>['deselect'])(),
      predicateSelected,
      preventSelectOnFocus,
      allowSelectOnFocus,
      multiselectable,
      selectsOnFocus,
      clears,
      popsUp,
      query,
      getAbility: (row, column) => planeApi.meta.value[row][column].ability || 'enabled',
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
      exact: multiselectable ? select.exact : (row, column) => select.exact(row, column, { replace: 'all' }),
    },
    deselect: multiselectable ? deselect : () => (deselect as PlaneFeatures<false>['deselect'])(),
    is: {
      focused: (row, column) => predicateFocused(row, column),
      selected: (row, column) => predicateSelected(row, column),
      enabled: (row, column) => planeApi.meta.value[row][column].ability === 'enabled',
      disabled: (row, column) => planeApi.meta.value[row][column].ability === 'disabled',
    },
    getStatuses,
  } as PlaneFeatures<Multiselectable>
}
