import { computed, customRef } from 'vue'
import type { ShallowReactive, Ref } from 'vue'
import type { MatchData } from 'fast-fuzzy'
import { createMap } from '@baleada/logic'
import type { Navigateable, Pickable, PickOptions } from '@baleada/logic'
import type { ListApi } from './useListApi'
import type { PlaneApi } from './usePlaneApi'
import { usePlaneFeatures } from './usePlaneFeatures'
import type {
  PlaneFeatures,
  PlaneFeaturesBase,
  UsePlaneFeaturesConfigBase,
  DefaultMeta,
  DeselectExactOptions,
} from './usePlaneFeatures'
import type { EligibleInPlanePickApi, BaseEligibleInPlanePickApiOptions } from './createEligibleInPlanePickApi'
import type { EligibleInPlaneNavigateApi, BaseEligibleInPlaneNavigateApiOptions } from './createEligibleInPlaneNavigateApi'
import type { Query } from './useQuery'
import type { PlaneWithEvents } from './usePlaneWithEvents'
import type { Ability } from './ability'
import { Plane } from './plane'
import type { Coordinates } from './coordinates'
import type { ToPlaneEligibility } from './createToEligibleInPlane'

export type ListFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? (
    & ListFeaturesBase
    & {
      select: EligibleInListPickApi,
      deselect: {
        exact: (
          indexOrIndices: number | number[],
          options?: DeselectExactOptions
        ) => void,
        all: () => void,
      }
    }
  )
  : (
    & ListFeaturesBase
    & {
      select: (
        & Omit<EligibleInListPickApi, 'exact'>
        & {
          exact: (index: number, options?: { toEligibility?: ToListEligibility }) => void
        }
      ),
      deselect: {
        exact: (index: number) => void,
        all: () => void,
      },
    }
  )

type EligibleInListPickApi = {
  exact: (indexOrIndices: number | number[], options?: BaseEligibleInListPickApiOptions) => ReturnType<EligibleInPlanePickApi['exact']>,
  next: (index: number, options?: BaseEligibleInListPickApiOptions) => ReturnType<EligibleInPlanePickApi['next']>,
  previous: (index: number, options?: BaseEligibleInListPickApiOptions) => ReturnType<EligibleInPlanePickApi['previous']>,
  all: (options?: BaseEligibleInListPickApiOptions) => ReturnType<EligibleInPlanePickApi['all']>,
}

type BaseEligibleInListPickApiOptions = PickOptions & { toEligibility?: ToListEligibility }

export type ToListEligibility = (index: number) => 'eligible' | 'ineligible'

type ListFeaturesBase<O extends Orientation = 'vertical'> = (
  & Query
  & Omit<PlaneWithEvents, 'is'>
  & Omit<
    PlaneFeaturesBase,
    | 'focusedRow'
    | 'focusedColumn'
    | 'focused'
    | 'focus'
    | 'results'
    | 'selectedRows'
    | 'selectedColumns'
    | 'selected'
    | 'superselected'
    | 'is'
    | 'total'
    | 'getStatuses'
  >
  & {
    focusedItem: ShallowReactive<Navigateable<O extends 'vertical' ? HTMLElement[] : HTMLElement>>,
    focused: Ref<number>,
    focus: EligibleInListNavigateApi,
    results: Ref<MatchData<string>[]>,
    selectedItems: ShallowReactive<Pickable<O extends 'vertical' ? HTMLElement[] : HTMLElement>>,
    selected: Ref<number[]>,
    superselected: Ref<number[]>,
    is: {
      pressed: (index: number) => boolean,
      released: (index: number) => boolean,
      focused: (index: number) => boolean,
      selected: (index: number) => boolean,
      superselected: (index: number) => boolean,
      enabled: (index: number) => boolean,
      disabled: (index: number) => boolean,
      focusing: () => boolean,
      selecting: () => boolean,
    },
    total: {
      selected: (index: number) => number,
    },
  }
)

type EligibleInListNavigateApi = {
  exact: (index: number, options?: BaseEligibleInListNavigateApiOptions) => ReturnType<EligibleInPlaneNavigateApi['exact']>,
  next: (index: number, options?: BaseEligibleInListNavigateApiOptions) => ReturnType<EligibleInPlaneNavigateApi['next']>,
  previous: (index: number, options?: BaseEligibleInListNavigateApiOptions) => ReturnType<EligibleInPlaneNavigateApi['previous']>,
  first: (options?: BaseEligibleInListNavigateApiOptions) => ReturnType<EligibleInPlaneNavigateApi['first']>,
  last: (options?: BaseEligibleInListNavigateApiOptions) => ReturnType<EligibleInPlaneNavigateApi['last']>,
  random: (options?: BaseEligibleInListNavigateApiOptions) => ReturnType<EligibleInPlaneNavigateApi['random']>,
}

type BaseEligibleInListNavigateApiOptions = { toEligibility?: ToListEligibility }

export type Orientation = 'vertical' | 'horizontal'

export type UseListFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  Meta extends { ability?: Ability, candidate?: string } = { ability?: Ability, candidate?: string }
> = (
  & UseListFeaturesConfigBase<Multiselectable, Clears, O, Meta>
  & (
    Multiselectable extends true
    ? {
      initialSelected: Clears extends true
        ? number | number[] | 'all' | 'none'
        : number | number[] | 'all',
    }
    : {
      initialSelected: Clears extends true
        ? number | 'none'
        : number,
    }
  )
)

type UseListFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  Meta extends DefaultMeta = DefaultMeta
> = (
  & Omit<
    UsePlaneFeaturesConfigBase<Multiselectable, Clears, Meta>,
    | 'planeApi'
    | 'initialFocused'
  >
  & {
    listApi: ListApi<HTMLElement, true, Meta>,
    initialFocused: number | 'selected',
    orientation: O,
  }
)

type OrientedFn<AcceptsCoordinates extends boolean, AcceptsToEligibilityOption extends boolean, T extends any> = (
  AcceptsCoordinates extends true
    ? AcceptsToEligibilityOption extends true
      ? AcceptsIndexAndToEligibilityOptionFn<T>
      : AcceptsIndexFn<T>
    : AcceptsToEligibilityOptionFn<T>
)
type AcceptsIndexAndToEligibilityOptionFn<T> = (index: number, options?: { toEligibility?: ToListEligibility }) => T
type AcceptsToEligibilityOptionFn<T> = (options?: { toEligibility?: ToListEligibility }) => T
type AcceptsIndexFn<T> = (index: number) => T

export function useListFeatures<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  O extends Orientation = 'vertical',
  Meta extends DefaultMeta = DefaultMeta
> (
  {
    listApi,
    orientation,
    multiselectable,
    clears,
    initialFocused,
    initialSelected,
    ...usePlaneFeaturesConfig
  }: UseListFeaturesConfig<Multiselectable, Clears, O, Meta>
) {
  const planeApi: PlaneApi<HTMLElement, true, Meta> = {
          ref: () => () => {},
          beforeUpdate: () => {},
          plane: orientation === 'vertical'
            ? verticalPlaneRef(listApi.list)
            : horizontalPlaneRef(listApi.list),
          meta: orientation === 'vertical'
            ? verticalPlaneRef(listApi.meta)
            : horizontalPlaneRef(listApi.meta),
          status: orientation === 'vertical'
            ? computed(() => ({
              order: listApi.status.value.order,
              rowLength: listApi.status.value.length,
              columnLength: 'none',
              meta: listApi.status.value.meta,
            }))
            : computed(() => ({
              order: listApi.status.value.order,
              rowLength: 'none',
              columnLength: listApi.status.value.length,
              meta: listApi.status.value.meta,
            })),
          ids: orientation === 'vertical'
            ? computed(() => toVerticalPlane(listApi.ids.value))
            : computed(() => toHorizontalPlane(listApi.ids.value)),
        },
        {
          focusedRow,
          focusedColumn,
          focused,
          focus,
          results,
          selectedRows,
          selectedColumns,
          selected,
          superselected,
          select,
          deselect,
          is,
          total,
          ...planeFeatures
        } = usePlaneFeatures<true, true, Meta>({
          planeApi,
          multiselectable: multiselectable as true,
          clears: clears as true,
          initialFocused: initialFocused === 'selected'
            ? initialFocused
            : orientation === 'vertical'
              ? [initialFocused, 0]
              : [0, initialFocused],
          initialSelected: (initialSelected === 'all' || initialSelected === 'none')
            ? initialSelected
            : orientation === 'vertical'
              ? [initialSelected, 0] as Coordinates
              : [0, initialSelected] as Coordinates,
              ...usePlaneFeaturesConfig,
        }),
        createOrientedFn = <
          AcceptsCoordinates extends boolean,
          AcceptsToEligibilityOption extends boolean,
          T extends any
        > (
          { acceptsCoordinates, acceptsToEligibilityOption }: {
            acceptsCoordinates: AcceptsCoordinates,
            acceptsToEligibilityOption: AcceptsToEligibilityOption,
          },
          planeFn: AcceptsCoordinates extends true
            ? AcceptsToEligibilityOption extends true
              ? (coordinates: Coordinates, options?: { toEligibility?: ToPlaneEligibility }) => T
              : (coordinates: Coordinates) => T
            : AcceptsToEligibilityOption extends true
              ? (options?: { toEligibility?: ToPlaneEligibility }) => T
              : never,
        ): OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T> => {
          if (acceptsCoordinates && acceptsToEligibilityOption && orientation === 'vertical') {
            const fn: AcceptsIndexAndToEligibilityOptionFn<T> = (index, options = {}) => {
              const planeOptions = toPlaneOptions(options)
              return planeFn([index, 0], planeOptions)
            }

            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          if (acceptsCoordinates && acceptsToEligibilityOption && orientation === 'horizontal') {
            const fn: AcceptsIndexAndToEligibilityOptionFn<T> = (index, options = {}) => {
              const planeOptions = toPlaneOptions(options)
              return planeFn([0, index], planeOptions)
            }

            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          if (acceptsCoordinates && orientation === 'vertical') {
            const fn: AcceptsIndexFn<T> = index => planeFn([index, 0])
            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          if (acceptsCoordinates && orientation === 'horizontal') {
            const fn: AcceptsIndexFn<T> = index => planeFn([0, index])
            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          const fn: AcceptsToEligibilityOptionFn<T> = options => (
            (planeFn as (options?: { toEligibility?: ToPlaneEligibility }) => T)(
              toPlaneOptions(options)
            )
          )

          return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
        },
        toPlaneOptions = <Options extends BaseEligibleInListPickApiOptions | BaseEligibleInListNavigateApiOptions>(
          options: Options
        ): Options extends BaseEligibleInListPickApiOptions ? BaseEligibleInPlanePickApiOptions : BaseEligibleInPlaneNavigateApiOptions => {
          const { toEligibility, ...rest } = options

          return {
            ...rest,
            ...(
              toEligibility
                ? { toEligibility: createToPlaneEligibility(toEligibility) }
                : {}
            ),
          }
        },
        createToPlaneEligibility = orientation === 'vertical'
          ? (toListEligibility: ToListEligibility) => (coordinates: Coordinates) => toListEligibility(coordinates[0])
          : (toListEligibility: ToListEligibility) => (coordinates: Coordinates) => toListEligibility(coordinates[1])


  return {
    ...planeFeatures,
    focusedItem: orientation === 'vertical'
      ? focusedRow
      : focusedColumn,
    focused: orientation === 'vertical'
      ? computed(() => toRows([focused.value])[0])
      : computed(() => toColumns([focused.value])[0]),
    focus: {
      exact: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: true },
        focus.exact
      ),
      next: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: true },
        focus.next
      ),
      previous: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: true },
        focus.previous
      ),
      first: createOrientedFn(
        { acceptsCoordinates: false, acceptsToEligibilityOption: true },
        focus.first
      ),
      last: createOrientedFn(
        { acceptsCoordinates: false, acceptsToEligibilityOption: true },
        focus.last
      ),
      random: createOrientedFn(
        { acceptsCoordinates: false, acceptsToEligibilityOption: true },
        focus.random
      ),
    },
    results: orientation === 'vertical'
      ? computed(() => toVerticalResults(results.value))
      : computed(() => toHorizontalResults(results.value)),
    selectedItems: orientation === 'vertical'
      ? selectedRows
      : selectedColumns,
    selected: orientation === 'vertical'
      ? computed(() => toRows(selected.value))
      : computed(() => toColumns(selected.value)),
    superselected: orientation === 'vertical'
      ? computed(() => toRows(superselected.value))
      : computed(() => toColumns(superselected.value)),
    select: {
      exact: (() => {
        if (multiselectable && orientation === 'vertical') {
          const exact: ListFeatures<true>['select']['exact'] = (indexOrIndices, options) => {
            const indices = Array.isArray(indexOrIndices)
                    ? indexOrIndices
                    : [indexOrIndices],
                  coordinatesList = toVerticalCoordinates(indices),
                  planeOptions = toPlaneOptions(options)

            return select.exact(coordinatesList, planeOptions)
          }

          return exact
        }

        if (multiselectable && orientation === 'horizontal') {
          const exact: ListFeatures<true>['select']['exact'] = (indexOrIndices, options) => {
            const indices = Array.isArray(indexOrIndices)
                    ? indexOrIndices
                    : [indexOrIndices],
                  coordinatesList = toHorizontalCoordinates(indices),
                  planeOptions = toPlaneOptions(options)

            return select.exact(coordinatesList, planeOptions)
          }

          return exact
        }

        return createOrientedFn(
          { acceptsCoordinates: true, acceptsToEligibilityOption: true },
          (select.exact as PlaneFeatures<false>['select']['exact'])
        )
      })(),
      next: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: true },
        select.next
      ),
      previous: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: true },
        select.previous
      ),
      all: createOrientedFn(
        { acceptsCoordinates: false, acceptsToEligibilityOption: true },
        select.all
      ),
    },
    deselect: {
      ...deselect,
      exact: (() => {
        if (multiselectable && orientation === 'vertical') {
          const exact: ListFeatures<true>['deselect']['exact'] = (indexOrIndices, options) => {
            const indices = Array.isArray(indexOrIndices)
                    ? indexOrIndices
                    : [indexOrIndices],
                  coordinatesList = toVerticalCoordinates(indices)

            return deselect.exact(coordinatesList, options)
          }

          return exact
        }

        if (multiselectable && orientation === 'horizontal') {
          const exact: ListFeatures<true>['deselect']['exact'] = (indexOrIndices, options) => {
            const indices = Array.isArray(indexOrIndices)
                    ? indexOrIndices
                    : [indexOrIndices],
                  coordinatesList = toHorizontalCoordinates(indices)

            return deselect.exact(coordinatesList, options)
          }

          return exact
        }

        return createOrientedFn(
          { acceptsCoordinates: true, acceptsToEligibilityOption: true },
          (deselect.exact as PlaneFeatures<false>['deselect']['exact'])
        )
      })(),
    },
    is: {
      ...is,
      pressed: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.pressed
      ),
      released: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.released
      ),
      focused: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.focused
      ),
      selected: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.selected
      ),
      superselected: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.superselected
      ),
      enabled: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.enabled
      ),
      disabled: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.disabled
      ),
    },
    total: {
      selected: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        total.selected
      ),
    },
  } as unknown as ListFeatures<Multiselectable>
}

function verticalPlaneRef<T> (list: Ref<T[]>) {
  return customRef(track => ({
    get: () => (track(), toVerticalPlane(list.value)),
    set: () => {},
  }))
}

function horizontalPlaneRef<T> (list: Ref<T[]>) {
  return customRef(track => ({
    get: () => (track(), toHorizontalPlane(list.value)),
    set: () => {},
  }))
}


function toVerticalPlane<T extends any> (list: T[]) {
  const plane = new Plane<T>([])

  for (let i = 0; i < list.length; i++) {
    plane.set([i, 0], list[i])
  }

  return plane
}

function toHorizontalPlane<T extends any> (list: T[]) {
  const plane = new Plane<T>([])

  for (let i = 0; i < list.length; i++) {
    plane.set([0, i], list[i])
  }

  return plane
}

const toRows = createMap<Coordinates, number>(([row]) => row),
      toColumns = createMap<Coordinates, number>(([, column]) => column),
      toVerticalCoordinates = createMap<number, Coordinates>(index => [index, 0]),
      toHorizontalCoordinates = createMap<number, Coordinates>(index => [0, index])

function toVerticalResults (plane: Plane<MatchData<string>>): MatchData<string>[] {
  const results: MatchData<string>[] = []

  for (let i = 0; i < plane.length; i++) {
    results.push(plane.get([i, 0]))
  }

  return results
}

function toHorizontalResults (plane: Plane<MatchData<string>>): MatchData<string>[] {
  const results: MatchData<string>[] = []

  for (let i = 0; i < plane[0].length; i++) {
    results.push(plane.get([0, i]))
  }

  return results
}
