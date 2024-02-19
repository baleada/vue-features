import { shallowRef, watch, nextTick, computed } from 'vue'
import type { Ref, ShallowReactive } from 'vue'
import { find, findIndex } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { createResults } from '@baleada/logic'
import type { Pickable, Navigateable } from '@baleada/logic'
import { bind, on } from '../affordances'
import { Plane } from './plane'
import type { PlaneApi } from './usePlaneApi'
import { createEligibleInPlaneNavigateApi } from './createEligibleInPlaneNavigateApi'
import { createEligibleInPlanePickApi } from './createEligibleInPlanePickApi'
import { planeOn } from './planeOn'
import { onPlaneRendered } from './onPlaneRendered'
import { useQuery } from './useQuery'
import type { Query } from './useQuery'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import { predicateCmd, predicateCtrl, predicateSpace } from './predicateKeycombo'
import type { UseListFeaturesConfig, DefaultMeta } from './useListFeatures'
import type { Ability } from './ability'

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

type PlaneFeaturesBase = Query & {
  focusedRow: ShallowReactive<Navigateable<HTMLElement[]>>,
  focusedColumn: ShallowReactive<Navigateable<HTMLElement>>,
  focused: Ref<[row: number, column: number]>,
  focus: ReturnType<typeof createEligibleInPlaneNavigateApi>,
  results: Ref<Plane<MatchData<string>>>,
  search: () => void,
  selectedRows: ShallowReactive<Pickable<HTMLElement[]>>,
  selectedColumns: ShallowReactive<Pickable<HTMLElement>>,
  selected: Ref<[row: number, column: number][]>,
  is: {
    focused: (coordinates: [row: number, column: number]) => boolean,
    selected: (coordinates: [row: number, column: number]) => boolean,
    enabled: (coordinates: [row: number, column: number]) => boolean,
    disabled: (coordinates: [row: number, column: number]) => boolean,
  }
  getStatuses: (coordinates: [row: number, column: number]) => ['focused' | 'blurred', 'selected' | 'deselected', Ability],
}

export type UsePlaneFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  Meta extends DefaultMeta = DefaultMeta
> = (
  & Omit<
    UseListFeaturesConfig<Multiselectable, Clears, Meta>,
    | 'listApi'
    | 'initialSelected'
    | 'needsAriaOwns'
    | 'orientation'
  >
  & {
    planeApi: PlaneApi<HTMLElement, true, Meta>,
  }
  & (
    Multiselectable extends true
    ? {
      initialSelected: Clears extends true
        ? [row: number, column: number] | [row: number, column: number][] | 'all' | 'none'
        : [row: number, column: number] | [row: number, column: number][] | 'all',
    }
    : {
      initialSelected: Clears extends true
        ? [row: number, column: number] | 'none'
        : [row: number, column: number],
    }
  )
)

export function usePlaneFeatures<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  Meta extends DefaultMeta = DefaultMeta
> (
  {
    rootApi,
    planeApi,
    clears,
    disabledElementsReceiveFocus,
    initialSelected,
    loops,
    multiselectable,
    queryMatchThreshold,
    selectsOnFocus,
    receivesFocus,
  }: UsePlaneFeaturesConfig<Multiselectable, Clears, Meta>
) {
  // BASIC BINDINGS
  bind(
    rootApi.element,
    { ariaMultiselectable: multiselectable ? 'true' : undefined },
  )

  
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
        if (!planeApi.plane.value[0].length) return

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
            let ability: Ability | 'none' = 'none',
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

  if (receivesFocus) {
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


  // QUERY
  const { query, type, paste } = useQuery(),
        results: PlaneFeatures<true>['results'] = shallowRef([]),
        search: PlaneFeatures<true>['search'] = () => {
          const candidates = toCandidates(planeApi.meta.value)

          const matchData = createResults(candidates, ({ sortKind }) => ({
            returnMatchData: true,
            threshold: 0,
            sortBy: sortKind.insertOrder,
            keySelector: ({ candidate }) => candidate,
          }))(query.value)

          const newResults: typeof results['value'] = new Plane()

          for (const { item: { row, column, candidate }, ...matchDatum } of matchData) {
            (newResults[row] || (newResults[row] = []))[column] = {
              ...matchDatum,
              item: candidate,
            }
          }

          results.value = newResults
        },
        toCandidates = (meta: Plane<Meta>) => {
          const candidates: { row: number, column: number, candidate: string }[] = []
          
          for (let row = 0; row < meta.length; row++) {
            for (let column = 0; column < meta[0].length; column++) {
              candidates.push({
                row,
                column,
                candidate: meta[row][column].candidate || planeApi.plane.value[row][column].textContent,
              })
            }
          }
          
          return candidates
        },
        predicateExceedsQueryMatchThreshold: ToPlaneEligibility = ([row, column]) => {
          if (results.value.length === 0) return 'ineligible'

          return results.value[row][column].score >= queryMatchThreshold
            ? 'eligible'
            : 'ineligible'
        }

  watch(
    results,
    () => focus.next(
      [focusedRow.location, focusedColumn.location - 1],
      { toEligibility: predicateExceedsQueryMatchThreshold }
    )
  )

  if (receivesFocus) {
    on(
      rootApi.element,
      {
        keydown: event => {
          if (
            event.key.length > 1
            || predicateCtrl(event)
            || predicateCmd(event)
          ) return

          event.preventDefault()

          if (query.value.length === 0 && predicateSpace(event)) return
          
          type(event.key)
          search()
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
        if (!planeApi.plane.value[0].length) return
        
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

  if (receivesFocus) {
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
    query: computed(() => query.value),
    type,
    paste,
    results: computed(() => results.value),
    search,
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
