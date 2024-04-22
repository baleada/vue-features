import { shallowRef, watch, nextTick, computed } from 'vue'
import type { Ref, ShallowReactive } from 'vue'
import {
  filter,
  find,
  findIndex,
  pipe,
  pipe as chain,
  some,
  toLength,
  map,
} from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import {
  createAssociativeArrayHas,
  createAssociativeArraySet,
  createAssociativeArrayValue,
  createMap,
  createResults,
  createSlice,
} from '@baleada/logic'
import type { Pickable, Navigateable } from '@baleada/logic'
import { bind, on } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { PlaneApi } from './usePlaneApi'
import { Plane } from './plane'
import type { Coordinates } from './coordinates'
import { useQuery } from './useQuery'
import type { Query } from './useQuery'
import { createEligibleInPlaneNavigateApi } from './createEligibleInPlaneNavigateApi'
import type { EligibleInPlaneNavigateApi } from './createEligibleInPlaneNavigateApi'
import { createEligibleInPlanePickApi } from './createEligibleInPlanePickApi'
import type { EligibleInPlanePickApi } from './createEligibleInPlanePickApi'
import { usePlaneWithEvents } from './usePlaneWithEvents'
import type { PlaneWithEvents } from './usePlaneWithEvents'
import { onPlaneRendered } from './onPlaneRendered'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import { predicateSpace } from './predicateKeycombo'
import type { Ability } from './ability'
import { createCoordinatesEqual } from './createCoordinatesEqual'

export type PlaneFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? PlaneFeaturesBase & {
    select: EligibleInPlanePickApi,
    deselect: {
      exact: (
        coordinateOrCoordinates: Coordinates | Coordinates[],
        options?: DeselectExactOptions
      ) => void,
      all: () => void,
    }
  }
  : PlaneFeaturesBase & {
    select: Omit<EligibleInPlanePickApi, 'exact'> & { exact: (coordinates: Coordinates) => void },
    deselect: {
      exact: (coordinate: Coordinates) => void,
      all: () => void,
    },
  }

type PlaneFeaturesBase = (
  & Query
  & Omit<PlaneWithEvents, 'is'>
  & {
    focusedRow: ShallowReactive<Navigateable<HTMLElement[]>>,
    focusedColumn: ShallowReactive<Navigateable<HTMLElement>>,
    focused: Ref<Coordinates>,
    focus: EligibleInPlaneNavigateApi,
    results: Ref<Plane<MatchData<string>>>,
    search: () => void,
    selectedRows: ShallowReactive<Pickable<HTMLElement[]>>,
    selectedColumns: ShallowReactive<Pickable<HTMLElement>>,
    selected: Ref<Coordinates[]>,
    superselected: Ref<Coordinates[]>,
    status: Ref<'focusing' | 'selecting'>,
    focusing: () => 'focusing',
    selecting: () => 'selecting',
    toggle: () => 'focusing' | 'selecting',
    is: (
      & PlaneWithEvents['is']
      & {
        focused: (coordinates: Coordinates) => boolean,
        selected: (coordinates: Coordinates) => boolean,
        superselected: (coordinates: Coordinates) => boolean,
        enabled: (coordinates: Coordinates) => boolean,
        disabled: (coordinates: Coordinates) => boolean,
        focusing: () => boolean,
        selecting: () => boolean,
      }
    ),
    total: {
      selected: (coordinates: Coordinates) => number,
    },
    getStatuses: (coordinates: Coordinates) => [
      'focused' | 'blurred',
      'selected' | 'deselected',
      'superselected' | 'superdeselected',
      Ability,
    ],
  }
)

export type UsePlaneFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends { ability?: Ability, candidate?: string } = { ability?: Ability, candidate?: string }
> = (
  & UsePlaneFeaturesConfigBase<Multiselectable, Clears, Meta>
  & (
    Multiselectable extends true
    ? {
      initialSelected: Clears extends true
        ? Coordinates | Coordinates[] | 'all' | 'none'
        : Coordinates | Coordinates[] | 'all',
    }
    : {
      initialSelected: Clears extends true
        ? Coordinates | 'none'
        : Coordinates,
    }
  )
)

type UsePlaneFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends DefaultMeta = DefaultMeta
> = {
  rootApi: ElementApi<HTMLElement, true>,
  planeApi: PlaneApi<HTMLElement, true, Meta>,
  clears: Clears,
  initialFocused: Coordinates | 'selected',
  initialStatus: PlaneStatus,
  disabledElementsReceiveFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  multiselectable: Multiselectable,
  needsAriaOwns: boolean,
  queryMatchThreshold: number,
  receivesFocus: boolean,
}

export type PlaneStatus = 'focusing' | 'selecting'

export type DefaultMeta = { ability?: Ability, candidate?: string }

export type DeselectExactOptions = {
  limit?: number | true,
  order?: 'chronological' | 'reverse chronological',
}

const defaultDeselectExactOptions: DeselectExactOptions = {
  limit: true,
  order: 'chronological',
}

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
    initialFocused,
    initialSelected,
    initialStatus,
    loops,
    multiselectable,
    queryMatchThreshold,
    receivesFocus,
  }: UsePlaneFeaturesConfig<Multiselectable, Clears, Meta>
) {
  // ELIGIBILITY
  const toNextEligible = createToNextEligible({ api: planeApi }),
        toPreviousEligible = createToPreviousEligible({ api: planeApi })


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


  // STATUS
  const status: PlaneFeatures<true>['status'] = shallowRef(initialStatus),
        focusing = () => status.value = 'focusing',
        selecting = () => status.value = 'selecting',
        toggle = () => (
          status.value = status.value === 'focusing'
            ? 'selecting'
            : 'focusing'
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
        preventSelect()
        ;(() => {
          if (initialFocused !== 'selected') {
            focus.exact(initialFocused)
            return
          }

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
              ability = focus.exact(initialSelected[index] as Coordinates)
              index--
            }

            return
          }

          const ability = focus.exact(initialSelected as Coordinates)
          if (ability !== 'none') return
          focus.first()
        })()
        nextTick(allowFocus)
        nextTick(allowSelect)

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
          get: ([row, column]) => (
            row === focused.value[0]
            && column === focused.value[1]
          ) ? 0 : -1,
          watchSource: [() => focused.value],
        },
      }
    )
  }


  // QUERY
  const { query, type, paste } = useQuery(),
        results: PlaneFeatures<true>['results'] = shallowRef(new Plane()),
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
            || event.ctrlKey
            || event.metaKey
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
          const selected: Coordinates[] = []

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
          exact: (coordinatesOrCoordinatesList, options = {}) => {
            const { limit, order } = { ...defaultDeselectExactOptions, ...options },
                  coordinatesList = Array.isArray(coordinatesOrCoordinatesList[0])
                    ? coordinatesOrCoordinatesList as Coordinates[]
                    : [coordinatesOrCoordinatesList] as Coordinates[]

            if (!clears && coordinatesList.length === selectedRows.picks.length) return

            const omitIndices: number[] = [],
                  totalOmitsByCoordinates = createMap<Coordinates, [Coordinates, number]>(
                    coordinates => [coordinates, 0]
                  )(coordinatesList),
                  predicateAnyLimitNotReached = () => limit === true || pipe<[Coordinates, number]>(
                    map<[Coordinates, number], number>(([_, totalOmits]) => totalOmits),
                    some<number>(totalOmits => totalOmits < limit)
                  )(totalOmitsByCoordinates),
                  mutateIndex = order === 'chronological'
                    ? () => index++
                    : () => index--,
                  predicatePassedLastIndex = order === 'chronological'
                    ? () => index >= selected.value.length
                    : () => index < 0

            let index = order === 'chronological'
              ? 0
              : selected.value.length - 1

            while (predicateAnyLimitNotReached() && !predicatePassedLastIndex()) {
              const coordinates: Coordinates = [selectedRows.picks[index], selectedColumns.picks[index]]

              if (!createAssociativeArrayHas<Coordinates>(
                coordinates,
                { predicateKey: createCoordinatesEqual(coordinates) }
              )(totalOmitsByCoordinates)) {
                mutateIndex()
                continue
              }

              omitIndices.push(index)

              chain<Coordinates>(
                createAssociativeArrayValue<Coordinates, [Coordinates, number]>(coordinates),
                totalOmits => createAssociativeArraySet<Coordinates, [Coordinates, number]>(
                  coordinates,
                  totalOmits + 1,
                ),
              )(totalOmitsByCoordinates)

              mutateIndex()
            }

            if (!omitIndices.length) return

            selectedRows.omit(omitIndices, { reference: 'picks' })
            selectedColumns.omit(omitIndices, { reference: 'picks' })
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
        preventSelect = () => selectStatus = 'prevented',
        allowSelect = () => selectStatus = 'allowed'

  let selectStatus: 'allowed' | 'prevented' = 'allowed'

  watch(
    () => focused.value,
    () => {
      if (
        status.value === 'focusing'
        || selectStatus === 'prevented'
      ) return
      select.exact(focused.value, { replace: 'all' })
    }
  )

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
              ? initialSelected as Coordinates[]
              : [initialSelected] as Coordinates[]

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


  // SUPERSELECTED
  const superselectedStartIndex = shallowRef<number>(-1),
        superselected = computed(() => createSlice<Coordinates>(superselectedStartIndex.value)(selected.value)),
        predicateSuperselected: PlaneFeatures<true>['is']['superselected'] = ([row, column]) => !!(
          find<Coordinates>(
            i => i[0] === row && i[1] === column
          )(superselected.value)
        )


  // MULTIPLE CONCERNS
  const getStatuses: PlaneFeatures<true>['getStatuses'] = ([row, column]) => {
    return [
      predicateFocused([row, column]) ? 'focused' : 'blurred',
      predicateSelected([row, column]) ? 'selected' : 'deselected',
      predicateSuperselected([row, column]) ? 'superselected' : 'superdeselected',
      planeApi.meta.value[row][column].ability,
    ]
  }

  // TODO: way to avoid adding event listeners for combobox which does this separately
  // `receivesFocus` + generics probably.
  const withEvents = usePlaneWithEvents({
    keyboardElement: rootApi.element,
    pointerElement: rootApi.element,
    getCoordinates: id => {
      const row = findIndex<string[]>(row =>
              !!(find<string>(i => i === id)(row) as string)
            )(planeApi.ids.value) as number,
            column = findIndex<string>(i => i === id)(planeApi.ids.value[row] || []) as number

      return [row, column]
    },
    focused,
    selectedRows,
    selectedColumns,
    selected,
    query,
    focus,
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
    predicateSelected,
    preventSelect,
    allowSelect,
    superselectedStartIndex,
    superselected,
    status,
    multiselectable,
    clears,
    toAbility: coordinates => planeApi.meta.value.get(coordinates).ability || 'enabled',
    toNextEligible,
    toPreviousEligible,
  })


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
    superselected,
    status,
    focusing,
    selecting,
    toggle,
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
    ...withEvents,
    is: {
      focused: coordinates => predicateFocused(coordinates),
      selected: coordinates => predicateSelected(coordinates),
      superselected: coordinates => predicateSuperselected(coordinates),
      enabled: coordinates => predicateEnabled(coordinates),
      disabled: coordinates => predicateDisabled(coordinates),
      focusing: () => status.value === 'focusing',
      selecting: () => status.value === 'selecting',
      ...withEvents.is,
    },
    total: {
      selected: coordinates => {
        const predicateEqual = createCoordinatesEqual(coordinates)

        return pipe(
          filter(predicateEqual),
          toLength(),
        )(selected.value)
      },
    },
    getStatuses,
  } as PlaneFeatures<Multiselectable>
}
