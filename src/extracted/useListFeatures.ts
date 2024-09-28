import { computed, type ShallowReactive, type Ref } from 'vue'
import { type MatchData } from 'fast-fuzzy'
import {
  createMap,
  type Navigateable,
  type Pickable,
  type PickOptions,
} from '@baleada/logic'
import { bind } from '../affordances'
import { createMultiRef } from '../transforms'
import { type ListApi } from './useListApi'
import { usePlaneApi, type PlaneApi } from './usePlaneApi'
import {
  usePlaneFeatures,
  type PlaneFeatures,
  type PlaneFeaturesBase,
  type UsePlaneFeaturesConfigBase,
  type DefaultPointMeta,
  type DeselectExactOptions,
  type DefaultRootMeta,
  type DefaultKeyboardTargetMeta,
} from './usePlaneFeatures'
import {
  type EligibleInPlanePickApi,
  type BaseEligibleInPlanePickApiOptions,
} from './useEligibleInPlanePickApi'
import {
  type EligibleInPlaneNavigateApi,
  type BaseEligibleInPlaneNavigateApiOptions,
} from './useEligibleInPlaneNavigateApi'
import { type Query } from './useQuery'
import { type Plane } from './plane'
import { type Coordinates } from './coordinates'
import {
  type ToPlaneEligibility,
} from './createToEligibleInPlane'
import { toTokenList } from './toTokenList'
import { type Orientation } from './orientation'
import { type SupportedElement } from './toRenderedKind'

export type ListFeatures<
  Multiselectable extends boolean = false,
  O extends Orientation = 'vertical',
  ItemMeta extends DefaultPointMeta = DefaultPointMeta,
> = Multiselectable extends true
  ? (
    & ListFeaturesBase<O, ItemMeta>
    & {
      select: EligibleInListPickApi,
      deselect: {
        exact: (
          indexOrIndices: number | number[],
          options?: DeselectExactOptions
        ) => void,
        all: () => void,
      },
    }
  )
  : (
    & ListFeaturesBase<O, ItemMeta>
    & {
      select: (
        & Omit<EligibleInListPickApi, 'exact'>
        & {
          exact: (index: number, options?: { toEligibility?: ToListEligibility }) => void,
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

type ListFeaturesBase<
  O extends Orientation = 'vertical',
  ItemMeta extends DefaultPointMeta = DefaultPointMeta,
> = (
  & Query
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
    | 'pressed'
    | 'released'
    | 'is'
    | 'total'
    | 'getStatuses'
  >
  & {
    planeApi: PlaneApi<SupportedElement, false, ItemMeta>,
    focusedItem: ShallowReactive<Navigateable<O extends 'vertical' ? SupportedElement[] : SupportedElement>>,
    focused: Ref<number>,
    focus: EligibleInListNavigateApi,
    results: Ref<MatchData<string>[]>,
    selectedItems: ShallowReactive<Pickable<O extends 'vertical' ? SupportedElement[] : SupportedElement>>,
    selected: Ref<number[]>,
    superselected: Ref<number[]>,
    pressed: Ref<number>,
    released: Ref<number>,
    hovered: Ref<number>,
    is: {
      pressed: (index: number) => boolean,
      released: (index: number) => boolean,
      hovered: (index: number) => boolean,
      exited: (index: number) => boolean,
      focused: (index: number) => boolean,
      selected: (index: number) => boolean,
      superselected: (index: number) => boolean,
      enabled: (index?: number) => boolean,
      disabled: (index?: number) => boolean,
      valid: () => boolean,
      invalid: () => boolean,
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

export type UseListFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  RootMeta extends DefaultRootMeta = DefaultRootMeta,
  KeyboardTargetMeta extends DefaultKeyboardTargetMeta = DefaultKeyboardTargetMeta,
  ItemMeta extends DefaultPointMeta = DefaultPointMeta,
> = (
  & UseListFeaturesConfigBase<Multiselectable, Clears, O, RootMeta, KeyboardTargetMeta, ItemMeta>
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
  RootMeta extends DefaultRootMeta = DefaultRootMeta,
  KeyboardTargetMeta extends DefaultKeyboardTargetMeta = DefaultKeyboardTargetMeta,
  ItemMeta extends DefaultPointMeta = DefaultPointMeta,
> = (
  & Omit<
    UsePlaneFeaturesConfigBase<Multiselectable, Clears, RootMeta, KeyboardTargetMeta, ItemMeta>,
    | 'planeApi'
    | 'initialFocused'
  >
  & {
    listApi: ListApi<SupportedElement, true, ItemMeta>,
    defaultMeta?: ItemMeta,
    initialFocused: number | 'selected',
    orientation: O,
    needsAriaOwns: boolean,
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
  RootMeta extends DefaultRootMeta = DefaultRootMeta,
  KeyboardTargetMeta extends DefaultKeyboardTargetMeta = DefaultKeyboardTargetMeta,
  ItemMeta extends DefaultPointMeta = DefaultPointMeta,
> (
  {
    rootApi,
    listApi,
    defaultMeta,
    orientation,
    multiselectable,
    needsAriaOwns,
    clears,
    initialFocused,
    initialSelected,
    ...usePlaneFeaturesConfig
  }: UseListFeaturesConfig<Multiselectable, Clears, O, RootMeta, KeyboardTargetMeta, ItemMeta>
) {
  // BASIC BINDINGS
  bind(
    rootApi.element,
    {
      ariaOrientation: orientation,
      ...(
        needsAriaOwns
          ? {
            ariaOwns: {
              get: () => toTokenList(listApi.ids.value) as string,
              watchSource: listApi.ids,
            },
          }
          : undefined
      ),
    }
  )


  // MULTIPLE CONCERNS
  const planeApi = usePlaneApi({
          defaultMeta,
          toStatus: orientation === 'vertical'
            ? () => toVerticalStatus(listApi.status.value)
            : () => toHorizontalStatus(listApi.status.value),
        }),
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
          pressed,
          released,
          hovered,
          is,
          total,
          ...planeFeatures
        } = usePlaneFeatures<true, true, RootMeta, KeyboardTargetMeta, ItemMeta>({
          rootApi,
          planeApi,
          multiselectable: multiselectable as true,
          clears: clears as true,
          initialFocused: initialFocused === 'selected'
            ? initialFocused
            : orientation === 'vertical'
              ? { row: initialFocused, column: 0 }
              : { row: 0, column: initialFocused },
          initialSelected: (initialSelected === 'all' || initialSelected === 'none')
            ? initialSelected
            : Array.isArray(initialSelected)
              ? orientation === 'vertical'
                ? toVerticalCoordinatesList(initialSelected)
                : toHorizontalCoordinatesList(initialSelected)
              : orientation === 'vertical'
                ? { row: initialSelected, column: 0 }
                : { row: 0, column: initialSelected },
          ...usePlaneFeaturesConfig,
        }),
        createOrientedFn = <
          AcceptsCoordinates extends boolean,
          AcceptsToEligibilityOption extends boolean,
          T extends any,
        > (
          { acceptsCoordinates, acceptsToEligibilityOption }: {
            acceptsCoordinates: AcceptsCoordinates,
            acceptsToEligibilityOption: AcceptsToEligibilityOption,
          },
          planeFn: AcceptsCoordinates extends true
            ? AcceptsToEligibilityOption extends true
              ? (coordinates?: Coordinates, options?: { toEligibility?: ToPlaneEligibility }) => T
              : (coordinates?: Coordinates) => T
            : AcceptsToEligibilityOption extends true
              ? (options?: { toEligibility?: ToPlaneEligibility }) => T
              : never,
        ): OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T> => {
          if (acceptsCoordinates && acceptsToEligibilityOption && orientation === 'vertical') {
            const fn: AcceptsIndexAndToEligibilityOptionFn<T> = (index, options = {}) => {
              const planeOptions = toPlaneOptions(options)
              return planeFn({ row: index, column: 0 }, planeOptions)
            }

            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          if (acceptsCoordinates && acceptsToEligibilityOption && orientation === 'horizontal') {
            const fn: AcceptsIndexAndToEligibilityOptionFn<T> = (index, options = {}) => {
              const planeOptions = toPlaneOptions(options)
              return planeFn({ row: 0, column: index }, planeOptions)
            }

            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          if (acceptsCoordinates && orientation === 'vertical') {
            const fn: AcceptsIndexFn<T> = index => (
              typeof index === 'number'
                ? planeFn({ row: index, column: 0 })
                : planeFn()
            )
            return fn as OrientedFn<AcceptsCoordinates, AcceptsToEligibilityOption, T>
          }

          if (acceptsCoordinates && orientation === 'horizontal') {
            const fn: AcceptsIndexFn<T> = index => (
              typeof index === 'number'
                ? planeFn({ row: 0, column: index })
                : planeFn()
            )
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
          options: Options = {} as Options
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
          ? (toListEligibility: ToListEligibility) => (coordinates: Coordinates) => toListEligibility(coordinates.row)
          : (toListEligibility: ToListEligibility) => (coordinates: Coordinates) => toListEligibility(coordinates.column)

  return {
    planeApi,
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
                  coordinatesList = toVerticalCoordinatesList(indices),
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
                  coordinatesList = toHorizontalCoordinatesList(indices),
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
                  coordinatesList = toVerticalCoordinatesList(indices)

            return deselect.exact(coordinatesList, options)
          }

          return exact
        }

        if (multiselectable && orientation === 'horizontal') {
          const exact: ListFeatures<true>['deselect']['exact'] = (indexOrIndices, options) => {
            const indices = Array.isArray(indexOrIndices)
                    ? indexOrIndices
                    : [indexOrIndices],
                  coordinatesList = toHorizontalCoordinatesList(indices)

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
    pressed: orientation === 'vertical'
      ? computed(() => pressed.value.row)
      : computed(() => pressed.value.column),
    released: orientation === 'vertical'
      ? computed(() => released.value.row)
      : computed(() => released.value.column),
    hovered: orientation === 'vertical'
      ? computed(() => hovered.value.row)
      : computed(() => hovered.value.column),
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
      hovered: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.hovered
      ),
      exited: createOrientedFn(
        { acceptsCoordinates: true, acceptsToEligibilityOption: false },
        is.exited
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
  } as unknown as ListFeatures<Multiselectable, O, ItemMeta>
}

export function toVerticalStatus (status: ListApi<any>['status']['value']): PlaneApi<any>['status']['value'] {
  return {
    order: status.order,
    rowWidth: status.length,
    columnHeight: 'none',
    meta: status.meta,
  }
}

export function toHorizontalStatus (status: ListApi<any>['status']['value']): PlaneApi<any>['status']['value'] {
  return {
    order: status.order,
    rowWidth: 'none',
    columnHeight: status.length,
    meta: status.meta,
  }
}

export function createListFeaturesMultiRef<ItemMeta extends DefaultPointMeta = DefaultPointMeta> (
  { orientation, listApiRef, planeApiRef }: {
    orientation: Orientation,
    listApiRef: ListApi<SupportedElement, any, ItemMeta>['ref'],
    planeApiRef: PlaneApi<SupportedElement, any, ItemMeta>['ref'],
  }
): ListApi<SupportedElement, any, ItemMeta>['ref']  {
  return orientation === 'vertical'
    ? (index, meta) => createMultiRef(
      planeApiRef(toVerticalCoordinates(index), meta),
      listApiRef(index, meta),
    )
    : (index, meta) => createMultiRef(
      planeApiRef(toHorizontalCoordinates(index), meta),
      listApiRef(index, meta),
    )
}

function toVerticalCoordinates (index: number): Coordinates {
  return { row: index, column: 0 }
}

function toHorizontalCoordinates (index: number): Coordinates {
  return { row: 0, column: index }
}

const toRows = createMap<Coordinates, number>(({ row }) => row),
      toColumns = createMap<Coordinates, number>(({ column }) => column),
      toVerticalCoordinatesList = createMap<number, Coordinates>(index => ({ row: index, column: 0 })),
      toHorizontalCoordinatesList = createMap<number, Coordinates>(index => ({ row: 0, column: index }))

function toVerticalResults (plane: Plane<MatchData<string>>): MatchData<string>[] {
  const results: MatchData<string>[] = []

  for (let i = 0; i < plane.length; i++) {
    results.push(plane.get({ row: i, column: 0 }))
  }

  return results
}

function toHorizontalResults (plane: Plane<MatchData<string>>): MatchData<string>[] {
  const results: MatchData<string>[] = []

  for (let i = 0; i < plane[0].length; i++) {
    results.push(plane.get({ row: 0, column: i }))
  }

  return results
}
