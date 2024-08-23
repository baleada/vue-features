import { shallowRef, watch, nextTick, computed } from 'vue'
import type { Ref, ShallowReactive } from 'vue'
import {
  filter,
  find,
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
import { type Coordinates } from './coordinates'
import { useQuery } from './useQuery'
import type { Query, UseQueryOptions } from './useQuery'
import { useEligibleInPlaneNavigateApi } from './useEligibleInPlaneNavigateApi'
import type { EligibleInPlaneNavigateApi } from './useEligibleInPlaneNavigateApi'
import { useEligibleInPlanePickApi } from './useEligibleInPlanePickApi'
import type { EligibleInPlanePickApi } from './useEligibleInPlanePickApi'
import { usePlaneInteractions } from './usePlaneInteractions'
import type { PlaneInteractions } from './usePlaneInteractions'
import { onPlaneRendered } from './onPlaneRendered'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import { predicateSpace } from './predicateKeycombo'
import type { Ability } from './ability'
import { createCoordinatesEqual } from './createCoordinatesEqual'
import { createGetCoordinates } from './createGetCoordinates'
import { toLabelBindValues } from './toLabelBindValues'
import type { LabelMeta } from './toLabelBindValues'
import { toAbilityBindValues } from './toAbilityBindValues'
import type { AbilityMeta } from './toAbilityBindValues'
import type { Targetability } from './targetability'

export type PlaneFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? (
    & PlaneFeaturesBase
    & {
      select: EligibleInPlanePickApi,
      deselect: {
        exact: (
          coordinateOrCoordinates: Coordinates | Coordinates[],
          options?: DeselectExactOptions
        ) => void,
        all: () => void,
      }
    }
  )
  : (
    & PlaneFeaturesBase
    & {
      select: (
        & Omit<EligibleInPlanePickApi, 'exact'>
        & {
          exact: (coordinates: Coordinates, options?: { toEligibility?: ToPlaneEligibility }) => void,
        }
      ),
      deselect: {
        exact: (coordinate: Coordinates) => void,
        all: () => void,
      },
    }
  )

export type PlaneFeaturesBase = (
  & Query
  & Omit<PlaneInteractions, 'is'>
  & {
    focusedRow: ShallowReactive<Navigateable<HTMLElement[]>>,
    focusedColumn: ShallowReactive<Navigateable<HTMLElement>>,
    focused: Ref<Coordinates>,
    focusedElement: Ref<HTMLElement>,
    focus: EligibleInPlaneNavigateApi,
    results: Ref<Plane<MatchData<string>>>,
    search: () => void,
    selectedRows: ShallowReactive<Pickable<HTMLElement[]>>,
    selectedColumns: ShallowReactive<Pickable<HTMLElement>>,
    selected: Ref<Coordinates[]>,
    superselected: Ref<Coordinates[]>,
    superselect: {
      from: (index: number) => number,
    },
    keyboardStatus: Ref<'focusing' | 'selecting'>,
    focusing: () => 'focusing',
    selecting: () => 'selecting',
    is: (
      & PlaneInteractions['is']
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
    }
  }
)

export type UsePlaneFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  RootMeta extends DefaultRootMeta = DefaultRootMeta,
  KeyboardTargetMeta extends DefaultKeyboardTargetMeta = DefaultRootMeta & DefaultKeyboardTargetMeta,
  PointMeta extends DefaultPointMeta = DefaultPointMeta
> = (
  & UsePlaneFeaturesConfigBase<Multiselectable, Clears, RootMeta, KeyboardTargetMeta, PointMeta>
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

export type UsePlaneFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  RootMeta extends DefaultRootMeta = DefaultRootMeta,
  KeyboardTargetMeta extends DefaultKeyboardTargetMeta = DefaultRootMeta & DefaultKeyboardTargetMeta,
  PointMeta extends DefaultPointMeta = DefaultPointMeta
> = {
  rootApi: ElementApi<HTMLElement, true, RootMeta>,
  keyboardTargetApi: ElementApi<HTMLElement, true, KeyboardTargetMeta>,
  planeApi: PlaneApi<HTMLElement, any, PointMeta>,
  clears: Clears,
  initialFocused: Coordinates | 'selected',
  initialSuperselectedFrom: number,
  initialKeyboardStatus: PlaneKeyboardStatus,
  disabledElementsReceiveFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  multiselectable: Multiselectable,
  query: (
    & UseQueryOptions
    & { matchThreshold?: number }
  ),
  receivesFocus: boolean,
}

export type PlaneKeyboardStatus = 'focusing' | 'selecting'

export type DefaultRootMeta = LabelMeta & AbilityMeta
export type DefaultKeyboardTargetMeta = LabelMeta & AbilityMeta & { targetability?: Targetability }
export type DefaultPointMeta = LabelMeta & AbilityMeta & { candidate?: string }

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
  RootMeta extends DefaultRootMeta = DefaultRootMeta,
  KeyboardTargetMeta extends DefaultKeyboardTargetMeta = DefaultKeyboardTargetMeta,
  PointMeta extends DefaultPointMeta = DefaultPointMeta
> (
  {
    rootApi,
    keyboardTargetApi,
    planeApi,
    clears,
    disabledElementsReceiveFocus,
    initialFocused,
    initialKeyboardStatus,
    initialSelected,
    initialSuperselectedFrom,
    loops,
    multiselectable,
    query: queryConfig,
    receivesFocus,
  }: UsePlaneFeaturesConfig<Multiselectable, Clears, RootMeta, KeyboardTargetMeta, PointMeta>
) {
  // ELIGIBILITY
  const toNextEligible = createToNextEligible({ api: planeApi }),
        toPreviousEligible = createToPreviousEligible({ api: planeApi })


  // BASIC BINDINGS
  for (const api of [rootApi, keyboardTargetApi] as const) {
    bind(
      api.element,
      {
        ariaMultiselectable: multiselectable ? 'true' : undefined,
        ...toLabelBindValues(api),
        ...toAbilityBindValues(api),
        ...(api === rootApi ? { tabindex: -1 } : {}),
      },
    )
  }

  bind(
    planeApi.plane,
    toLabelBindValues(planeApi),
  )


  // PLANE ABILITY
  const isEnabled = shallowRef<Plane<boolean>>(new Plane()),
        isDisabled = shallowRef<Plane<boolean>>(new Plane()),
        predicateEnabled: PlaneFeatures['is']['enabled'] = ({ row, column }) => isEnabled.value.get({ row, column }),
        predicateDisabled: PlaneFeatures['is']['disabled'] = ({ row, column }) => isDisabled.value.get({ row, column })

  onPlaneRendered(
    planeApi.meta,
    {
      predicateRenderedWatchSourcesChanged: () => planeApi.status.value.meta === 'changed',
      beforeItemEffects: () => {
        isEnabled.value = new Plane()
        isDisabled.value = new Plane()
      },
      itemEffect: ({ ability }, coordinates) => {
        isEnabled.value.set(coordinates, ability === 'enabled')
        isDisabled.value.set(coordinates, ability === 'disabled')
      },
    }
  )


  // STATUS
  const keyboardStatus: PlaneFeatures<true>['keyboardStatus'] = shallowRef(initialKeyboardStatus),
        focusing: PlaneFeatures['focusing'] = () => keyboardStatus.value = 'focusing',
        selecting: PlaneFeatures['selecting'] = () => keyboardStatus.value = 'selecting'


  // FOCUSED
  const focusedRow: PlaneFeatures<true>['focusedRow'] = useNavigateable(planeApi.plane.value),
        focusedColumn: PlaneFeatures<true>['focusedColumn'] = useNavigateable(planeApi.plane.value[0] || []),
        focused: PlaneFeatures<true>['focused'] = computed(() => ({
          row: focusedRow.location,
          column: focusedColumn.location,
        })),
        focusedElement: PlaneFeatures<true>['focusedElement'] = computed(
          () => planeApi.plane.value.get(focused.value)
        ),
        focus: PlaneFeatures<true>['focus'] = useEligibleInPlaneNavigateApi({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          rows: focusedRow,
          columns: focusedColumn,
          loops,
          api: planeApi,
        }),
        predicateFocused: PlaneFeatures<true>['is']['focused'] = ({ row, column }) => (
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
        || planeApi.status.value.rowWidth !== 'none'
        || planeApi.status.value.columnHeight !== 'none'
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

          if (Array.isArray(initialSelected)) {
            let ability: Ability | 'none' = 'none',
                index = initialSelected.length - 1

            while (ability === 'none' && index >= 0) {
              ability = focus.exact(initialSelected[index])
              index--
            }

            return
          }

          const ability = focus.exact(initialSelected)
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
      focused,
      coordinates => {
        if (
          rootApi.meta.value.ability === 'disabled'
          || planeApi.plane.value.get(coordinates) === document.activeElement
          || focusStatus === 'prevented'
        ) return
        planeApi.plane.value.get(coordinates)?.focus()
      }
    )
  }


  // QUERY
  const { matchThreshold, ...queryOptions } = queryConfig,
        { query, type, paste } = useQuery({ ...queryOptions }),
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
        toCandidates = (meta: Plane<PointMeta>) => {
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
        predicateExceedsQueryMatchThreshold: ToPlaneEligibility = ({ row, column }) => {
          if (results.value.length === 0) return 'ineligible'

          return results.value[row][column].score >= matchThreshold
            ? 'eligible'
            : 'ineligible'
        }

  watch(
    results,
    () => focus.next(
      { row: focusedRow.location, column: focusedColumn.location - 1 },
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

          if (query.value.length === 0 && predicateSpace({ code: event.code })) return

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
            selected.push({ row: selectedRows.picks[i], column: selectedColumns.picks[i] })
          }

          return selected
        }),
        select: PlaneFeatures<true>['select'] = useEligibleInPlanePickApi({
          rows: selectedRows,
          columns: selectedColumns,
          api: planeApi,
        }),
        deselect: PlaneFeatures<true>['deselect'] = {
          exact: (coordinatesOrCoordinatesList, options = {}) => {
            const { limit, order } = { ...defaultDeselectExactOptions, ...options },
                  coordinatesList = Array.isArray(coordinatesOrCoordinatesList)
                    ? coordinatesOrCoordinatesList
                    : [coordinatesOrCoordinatesList]

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
              const coordinates: Coordinates = { row: selectedRows.picks[index], column: selectedColumns.picks[index] }

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
        predicateSelected: PlaneFeatures<true>['is']['selected'] = ({ row, column }) => {
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
        keyboardStatus.value === 'focusing'
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
        || planeApi.status.value.rowWidth !== 'none'
        || planeApi.status.value.columnHeight !== 'none'
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

        switch (initialSelected) {
          case 'none':
            deselect.all()
            break
          case 'all':
            select.all()
            break
          default:
            const coordinatesList = Array.isArray(initialSelected)
              ? initialSelected
              : [initialSelected]

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
        get: ({ row, column }) => predicateSelected({ row, column }) ? 'true' : undefined,
        watchSource: [() => selectedRows.picks, () => selectedColumns.picks],
      },
    }
  )


  // SUPERSELECTED
  const superselectedFrom = shallowRef<number>(initialSuperselectedFrom),
        superselected = computed(() => createSlice<Coordinates>(superselectedFrom.value)(selected.value)),
        predicateSuperselected: PlaneFeatures<true>['is']['superselected'] = ({ row, column }) => !!(
          find<Coordinates>(
            i => i.row === row && i.column === column
          )(superselected.value)
        ),
        superselect: PlaneFeatures<true>['superselect'] = {
          from: index => superselectedFrom.value = index,
        }


  // MULTIPLE CONCERNS
  const withEvents = usePlaneInteractions({
    keyboardTargetApi,
    pointerTarget: rootApi.element,
    getCoordinates: createGetCoordinates(planeApi),
    focused,
    selectedRows,
    selectedColumns,
    selected,
    query,
    focus,
    select,
    deselect,
    predicateSelected,
    preventSelect,
    allowSelect,
    superselected,
    superselect,
    keyboardStatus,
    multiselectable,
    clears,
    toAbility: coordinates => planeApi.meta.value.get(coordinates).ability || 'enabled',
    toNextEligible,
    toPreviousEligible,
  })

  const planeAbilityBindValues = toAbilityBindValues(planeApi)
  bind(
    planeApi.plane,
    {
      ...planeAbilityBindValues,
      ...(
        !receivesFocus
          ? { tabindex: -1 }
          : {
            tabindex: {
              get: coordinates => (
                (
                  rootApi.meta.value.ability === 'enabled'
                  && createCoordinatesEqual(focused.value)(coordinates)
                )
                  ? disabledElementsReceiveFocus
                    ? 0
                    : planeAbilityBindValues.tabindex.get(coordinates)
                  : -1
              ),
              watchSource: [
                ...(
                  Array.isArray(planeAbilityBindValues.tabindex.watchSource)
                    ? planeAbilityBindValues.tabindex.watchSource
                    : [planeAbilityBindValues.tabindex.watchSource]
                ),
                focused,
                () => rootApi.meta.value.ability,
              ],
            },
          }
      ),
    },
  )

  return {
    focusedRow,
    focusedColumn,
    focused,
    focusedElement,
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
    keyboardStatus,
    focusing,
    selecting,
    select: {
      ...select,
      exact: multiselectable
        ? select.exact
        : (coordinates, options) => select.exact(coordinates, { ...options, replace: 'all' }),
    },
    deselect: multiselectable
      ? deselect
      : {
        exact: coordinates => deselect.exact(coordinates),
        all: () => deselect.all(),
      },
    superselect,
    ...withEvents,
    is: {
      focused: coordinates => predicateFocused(coordinates),
      selected: coordinates => predicateSelected(coordinates),
      superselected: coordinates => predicateSuperselected(coordinates),
      enabled: coordinates => predicateEnabled(coordinates),
      disabled: coordinates => predicateDisabled(coordinates),
      focusing: () => keyboardStatus.value === 'focusing',
      selecting: () => keyboardStatus.value === 'selecting',
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
  } as PlaneFeatures<Multiselectable>
}
