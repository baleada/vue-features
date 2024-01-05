import { shallowRef, watch, nextTick, computed } from 'vue'
import type { Ref, ShallowReactive } from 'vue'
import { find, findIndex } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { type Pickable, type Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import { Plane } from './plane'
import type { ElementApi } from './useElementApi'
import type { PlaneApi } from './usePlaneApi'
import { createEligibleInPlaneNavigateApi } from './createEligibleInPlaneNavigateApi'
import { createEligibleInPlanePickApi } from './createEligibleInPlanePickApi'
import { planeOn } from './planeOn'
import { onPlaneRendered } from './onPlaneRendered'

export type PlaneFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? PlaneFeaturesBase & {
    select: ReturnType<typeof createEligibleInPlanePickApi>,
    deselect: {
      exact: (coordinateOrCoordinates: [row: number, column: number] | [row: number, column: number][]) => void,
      all: () => void,
    }
  }
  : PlaneFeaturesBase & {
    select: Omit<ReturnType<typeof createEligibleInPlanePickApi>, 'exact'> & { exact: (coordinates: [row: number, column: number]) => void },
    deselect: {
      exact: (coordinate: [row: number, column: number]) => void,
      all: () => void,
    },
  }

type PlaneFeaturesBase = {
  focusedRow: ShallowReactive<Navigateable<HTMLElement[]>>,
  focusedColumn: ShallowReactive<Navigateable<HTMLElement>>,
  focused: Ref<[row: number, column: number]>,
  focus: ReturnType<typeof createEligibleInPlaneNavigateApi>,
  selectedRows: ShallowReactive<Pickable<HTMLElement[]>>,
  selectedColumns: ShallowReactive<Pickable<HTMLElement>>,
  selected: Ref<[row: number, column: number][]>,
  is: {
    focused: (coordinates: [row: number, column: number]) => boolean,
    selected: (coordinates: [row: number, column: number]) => boolean,
    enabled: (coordinates: [row: number, column: number]) => boolean,
    disabled: (coordinates: [row: number, column: number]) => boolean,
  }
  getStatuses: (coordinates: [row: number, column: number]) => ['focused' | 'blurred', 'selected' | 'deselected', 'enabled' | 'disabled'],
}

export type UsePlaneFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  Meta extends { ability?: 'enabled' | 'disabled' } = { ability?: 'enabled' | 'disabled' }
> = Multiselectable extends true
  ? UsePlaneFeaturesConfigBase<Multiselectable, Clears, Meta> & {
    // TODO: Support none and all
    initialSelected?: Clears extends true
      ? [row: number, column: number] | [row: number, column: number][] | 'all' | 'none'
      : [row: number, column: number] | [row: number, column: number][] | 'all',
  }
  : UsePlaneFeaturesConfigBase<Multiselectable, Clears, Meta> & {
    initialSelected?: Clears extends true
      ? [row: number, column: number] | 'none'
      : [row: number, column: number],
  }

type UsePlaneFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  Meta extends { ability?: 'enabled' | 'disabled' } = { ability?: 'enabled' | 'disabled' }
> = {
  rootApi: ElementApi<HTMLElement, true>,
  planeApi: PlaneApi<HTMLElement, true, Meta>,
  multiselectable: Multiselectable,
  clears: Clears,
  popsUp: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function usePlaneFeatures<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> (
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
  }: UsePlaneFeaturesConfig<Multiselectable, Clears>
) {
  // ABILITY
  const isEnabled = shallowRef<Plane<boolean>>(new Plane()),
        isDisabled = shallowRef<Plane<boolean>>(new Plane()),
        predicateEnabled: PlaneFeatures['is']['enabled'] = ([row, column]) => isEnabled.value[row]?.[column],
        predicateDisabled: PlaneFeatures['is']['disabled'] = ([row, column]) => isDisabled.value[row]?.[column]

  onPlaneRendered(
    planeApi.meta,
    {
      predicateRenderedWatchSourcesChanged: () => planeApi.status.value.meta === 'changed',
      beforeItemEffects: () => {
        isEnabled.value = new Plane()
        isDisabled.value = new Plane()
      },
      itemEffect: ({ ability }, [row, column]) => {
        ;(isEnabled.value[row] || (isEnabled.value[row] = []))[column] = ability === 'enabled'
        ;(isDisabled.value[row] || (isDisabled.value[row] = []))[column] = ability === 'disabled'
      },
    }
  )

  bind(
    planeApi.plane,
    {
      ariaDisabled: ([row, column]) => planeApi.meta.value[row][column].ability === 'disabled'
        ? true
        : undefined,
    },
  )


  // FOCUSED
  const focusedRow: PlaneFeatures<true>['focusedRow'] = useNavigateable(planeApi.plane.value),
        focusedColumn: PlaneFeatures<true>['focusedColumn'] = useNavigateable(planeApi.plane.value[0] || []),
        focused: PlaneFeatures<true>['focused'] = computed(() => [focusedRow.location, focusedColumn.location]),
        focus: PlaneFeatures<true>['focus'] = createEligibleInPlaneNavigateApi({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          rows: focusedRow,
          columns: focusedColumn,
          loops,
          api: planeApi,
        }),
        predicateFocused: PlaneFeatures<true>['is']['focused'] = ([row, column]) => (
          focusedRow.location === row
          && focusedColumn.location === column
        ),
        preventFocus = () => focusStatus = 'prevented',
        allowFocus = () => focusStatus = 'allowed'

  let focusStatus: 'allowed' | 'prevented' = 'allowed'

  onPlaneRendered(
    planeApi.plane,
    {
      predicateRenderedWatchSourcesChanged: () => (
        planeApi.status.value.order === 'changed'
        || planeApi.status.value.rowLength !== 'none'
        || planeApi.status.value.columnLength !== 'none'
      ),
      planeEffect: () => {
        focusedRow.array = planeApi.plane.value
        focusedColumn.array = planeApi.plane.value[0]
      },
    }
  )

  const stopInitialFocusEffect = onPlaneRendered(
    planeApi.plane,
    {
      planeEffect: () => {
        // Storage extensions might have already set location
        if (focusedRow.location !== 0 && focusedColumn.location !== 0) {
          stopInitialFocusEffect()
          return
        }

        preventFocus()
        ;(() => {
          if (initialSelected === 'all') {
            focus.last()
            return
          }

          if (initialSelected === 'none') {
            focus.first()
            return
          }

          if (Array.isArray(initialSelected[0])) {
            let ability: 'enabled' | 'disabled' | 'none' = 'none',
                index = initialSelected.length - 1
            
            while (ability === 'none' && index >= 0) {
              ability = focus.exact(initialSelected[index] as [row: number, column: number])
              index--
            }

            return
          }

          const ability = focus.exact(initialSelected as [row: number, column: number])
          if (ability !== 'none') return
          focus.first()
        })()
        nextTick(allowFocus)

        stopInitialFocusEffect()
      },
    }
  )

  if (transfersFocus) {
    watch(
      [() => focusedRow.location, () => focusedColumn.location],
      ([row, column]) => {
        if (
          planeApi.plane.value[row][column] === document.activeElement
          || focusStatus === 'prevented'
        ) return        
        planeApi.plane.value[row][column]?.focus()
      }
    )
    
    bind(
      planeApi.plane,
      {
        tabindex: {
          get: ([row, column]) => row === focusedRow.location && column === focusedColumn.location ? 0 : -1,
          watchSource: [() => focusedRow.location, () => focusedColumn.location],
        },
      }
    )
  }


  // SELECTED
  const selectedRows: PlaneFeatures<true>['selectedRows'] = usePickable(planeApi.plane.value),
        selectedColumns: PlaneFeatures<true>['selectedColumns'] = usePickable(planeApi.plane.value[0] || []),
        selected: PlaneFeatures<true>['selected'] = computed(() => {
          const selected: [row: number, column: number][] = []

          for (let i = 0; i < selectedRows.picks.length; i++) {
            selected.push([selectedRows.picks[i], selectedColumns.picks[i]])
          }

          return selected
        }),
        select: PlaneFeatures<true>['select'] = createEligibleInPlanePickApi({
          rows: selectedRows,
          columns: selectedColumns,
          api: planeApi,
        }),
        deselect: PlaneFeatures<true>['deselect'] = {
          exact: coordinatesOrCoordinatesList => {
            const coordinatesList = Array.isArray(coordinatesOrCoordinatesList[0])
              ? coordinatesOrCoordinatesList as [row: number, column: number][]
              : [coordinatesOrCoordinatesList] as [row: number, column: number][]
              
            if (!clears && coordinatesList.length === selectedRows.picks.length) return
              
            const selectedRowOmits: number[] = []
            const selectedColumnOmits: number[] = []
            
            for (let i = 0; i < selectedRows.picks.length; i++) {
              const coordinateIndex = findIndex<[row: number, column: number]>(
                ([row, column]) => selectedRows.picks[i] === row && selectedColumns.picks[i] === column
              )(coordinatesList) as number
              
              if (coordinateIndex > -1) {
                selectedRowOmits.push(i)
                selectedColumnOmits.push(i)
              }
            }

            selectedRows.omit(selectedRowOmits, { reference: 'picks' })
            selectedColumns.omit(selectedColumnOmits, { reference: 'picks' })
          },
          all: () => {
            if (!clears) return
            selectedRows.omit()
            selectedColumns.omit()
          },
        },
        predicateSelected: PlaneFeatures<true>['is']['selected'] = ([row, column]) => {
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
        if (multiselectionStatus === 'selecting' || focusStatus === 'prevented') return
        select.exact([focusedRow.location, focusedColumn.location], { replace: 'all' })
      }
    )
  }

  onPlaneRendered(
    planeApi.plane,
    {
      predicateRenderedWatchSourcesChanged: () => (
        planeApi.status.value.order === 'changed'
        || planeApi.status.value.rowLength !== 'none'
        || planeApi.status.value.columnLength !== 'none'
      ),
      planeEffect: () => {
        selectedRows.array = planeApi.plane.value
        selectedColumns.array = planeApi.plane.value[0]
      },
    }
  )

  const stopInitialSelectEffect = onPlaneRendered(
    planeApi.plane,
    {
      planeEffect: () => {
        // Storage extensions might have already set picks
        if (selectedRows.picks.length > 0) {
          stopInitialSelectEffect()
          return
        }

        switch (initialSelected) {
          case 'none':
            deselect.all()
            break
          case 'all':
            select.all()
            break
          default:
            const coordinatesList = Array.isArray(initialSelected[0])
              ? initialSelected as [row: number, column: number][]
              : [initialSelected] as [row: number, column: number][]

            select.exact(coordinatesList)
            break
        }

        stopInitialSelectEffect()
      },
    }
  )

  bind(
    planeApi.plane,
    {
      ariaSelected: {
        get: ([row, column]) => predicateSelected([row, column]) ? 'true' : undefined,
        watchSource: [() => selectedRows.picks, () => selectedColumns.picks],
      },
    }
  )


  // MULTIPLE CONCERNS
  const getStatuses: PlaneFeatures<true>['getStatuses'] = ([row, column]) => {
    return [
      predicateFocused([row, column]) ? 'focused' : 'blurred',
      predicateSelected([row, column]) ? 'selected' : 'deselected',
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
        exact: multiselectable ? select.exact : ([row, column]) => select.exact([row, column], { replace: 'all' }),
      },
      selectedRows,
      selectedColumns,
      deselect: multiselectable
        ? deselect
        : {
          exact: ([row, column]) => deselect.exact([row, column]),
          all: () => deselect.all(),
        },
      predicateSelected,
      preventSelectOnFocus,
      allowSelectOnFocus,
      multiselectable,
      selectsOnFocus,
      clears,
      popsUp,
      query,
      getAbility: ([row, column]) => planeApi.meta.value[row][column].ability || 'enabled',
    })
  }
  

  // API
  return {
    focusedRow,
    focusedColumn,
    focused,
    focus,
    selectedRows,
    selectedColumns,
    selected,
    select: {
      ...select,
      exact: multiselectable ? select.exact : ([row, column]) => select.exact([row, column], { replace: 'all' }),
    },
    deselect: multiselectable
      ? deselect
      : {
        exact: ([row, column]) => deselect.exact([row, column]),
        all: () => deselect.all(),
      },
    is: {
      focused: ([row, column]) => predicateFocused([row, column]),
      selected: ([row, column]) => predicateSelected([row, column]),
      enabled: ([row, column]) => predicateEnabled([row, column]),
      disabled: ([row, column]) => predicateDisabled([row, column]),
    },
    getStatuses,
  } as PlaneFeatures<Multiselectable>
}
