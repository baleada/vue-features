import type { ShallowReactive } from 'vue'
import { Navigateable } from '@baleada/logic'
import { find } from 'lazy-collections'
import type { PlaneApi } from './usePlaneApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import type { Ability } from './ability'
import type { Coordinates } from './coordinates'
import { onPlaneRendered } from './onPlaneRendered'
import type { AbilityMeta } from './toAbilityBindValues'
import type { SupportedElement } from './toRenderedKind'

export type EligibleInPlaneNavigateApi = {
  exact: (coordinates: Coordinates, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  next: (coordinates: Coordinates, options?: EligibleInPlaneNavigateNextPreviousOptions) => Ability | 'none',
  nextInRow: (coordinates: Coordinates, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  nextInColumn: (coordinates: Coordinates, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  previous: (coordinates: Coordinates, options?: EligibleInPlaneNavigateNextPreviousOptions) => Ability | 'none',
  previousInRow: (coordinates: Coordinates, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  previousInColumn: (coordinates: Coordinates, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  first: (options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  last: (options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  firstInRow: (row: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  lastInRow: (row: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  firstInColumn: (column: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  lastInColumn: (column: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  random: (options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
}

export type BaseEligibleInPlaneNavigateApiOptions = { toEligibility?: ToPlaneEligibility }

type EligibleInPlaneNavigateNextPreviousOptions = BaseEligibleInPlaneNavigateApiOptions & { direction?: 'vertical' | 'horizontal' }

const defaultEligibleInPlaneNavigateApiOptions: BaseEligibleInPlaneNavigateApiOptions = {
  toEligibility: () => 'eligible',
}

const defaultEligibleInPlaneNavigateNextPreviousOptions: EligibleInPlaneNavigateNextPreviousOptions = {
  direction: 'horizontal',
  toEligibility: () => 'eligible',
}

export function useEligibleInPlaneNavigateApi<Meta extends AbilityMeta> (
  {
    rows,
    columns,
    api,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    rows: ShallowReactive<Navigateable<SupportedElement[]>>,
    columns: ShallowReactive<Navigateable<SupportedElement>>,
    api: PlaneApi<SupportedElement, any, Meta>,
    disabledElementsAreEligibleLocations: boolean,
    loops: boolean,
  }
): EligibleInPlaneNavigateApi {
  const exact: EligibleInPlaneNavigateApi['exact'] = ({ row, column }, options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlaneNavigateApiOptions, ...options },
                r = new Navigateable(api.plane.value).navigate(row),
                c = new Navigateable(api.plane.value[0]).navigate(column),
                eligibility = toEligibility({ row: r.location, column: c.location })

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return toAbility({ row, column })
          }

          if (toAbility({ row, column }) === 'enabled' && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return 'enabled'
          }

          return 'none'
        },
        firstInRow: EligibleInPlaneNavigateApi['firstInRow'] = (row, options = {}) => {
          return nextInRow({ row, column: -1 }, options)
        },
        firstInColumn: EligibleInPlaneNavigateApi['firstInColumn'] = (column, options = {}) => {
          return nextInColumn({ row: -1, column }, options)
        },
        lastInRow: EligibleInPlaneNavigateApi['lastInRow'] = (row, options = {}) => {
          return previousInRow({ row, column: columns.array.length }, options)
        },
        lastInColumn: EligibleInPlaneNavigateApi['lastInColumn'] = (column, options = {}) => {
          return previousInColumn({ row: rows.array.length, column }, options)
        },
        first: EligibleInPlaneNavigateApi['first'] = (options = {}) => {
          for (let row = 0; row < rows.array.length; row++) {
            const a = nextInRow({ row, column: -1 }, options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        last: EligibleInPlaneNavigateApi['last'] = (options = {}) => {
          for (let row = rows.array.length - 1; row >= 0; row--) {
            const a = previousInRow({ row, column: columns.array.length }, options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        random: EligibleInPlaneNavigateApi['last'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlaneNavigateApiOptions, ...options },
                r = new Navigateable(api.plane.value).random(),
                c = new Navigateable(api.plane.value[0]).random()

          if (toEligibility({ row: r.location, column: c.location }) === 'eligible') return exact({ row: r.location, column: c.location })

          return 'none'
        },
        next: EligibleInPlaneNavigateApi['next'] = (coordinates, options = {}) => {
          const { direction, toEligibility } = { ...defaultEligibleInPlaneNavigateNextPreviousOptions, ...options }

          if (disabledElementsAreEligibleLocations) {
            const nextEligible = toNextEligible({
              coordinates,
              loops,
              direction,
              toEligibility,
            })

            if (nextEligible !== 'none') {
              const { row: newRow, column: newColumn } = nextEligible
              rows.navigate(newRow)
              columns.navigate(newColumn)
              return toAbility({ row: rows.location, column: columns.location })
            }

            return 'none'
          }

          const nextEligible = toNextEligible({
            coordinates,
            loops,
            direction,
            toEligibility: index => toAbility(index) === 'enabled'
              ? toEligibility(index)
              : 'ineligible',
          })

          if (nextEligible !== 'none') {
            const { row: newRow, column: newColumn } = nextEligible
            rows.navigate(newRow)
            columns.navigate(newColumn)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api }),
        nextInRow: EligibleInPlaneNavigateApi['nextInRow'] = ({ row, column }, options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlaneNavigateApiOptions, ...options }

          return next(
            { row, column },
            {
              direction: 'horizontal',
              toEligibility: ({ row: r, column: c }) => r === row && toEligibility({ row: r, column: c }) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        nextInColumn: EligibleInPlaneNavigateApi['nextInRow'] = ({ row, column }, options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlaneNavigateApiOptions, ...options }

          return next(
            { row, column },
            {
              direction: 'vertical',
              toEligibility: ({ row: r, column: c }) => c === column && toEligibility({ row: r, column: c }) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        previous: EligibleInPlaneNavigateApi['previous'] = (coordinates, options = {}) => {
          const { direction, toEligibility } = { ...defaultEligibleInPlaneNavigateNextPreviousOptions, ...options }

          if (disabledElementsAreEligibleLocations) {
            const previousEligible = toPreviousEligible({
              coordinates,
              loops,
              direction,
              toEligibility,
            })

            if (previousEligible !== 'none') {
              const { row: newRow, column: newColumn } = previousEligible
              rows.navigate(newRow)
              columns.navigate(newColumn)
              return toAbility({ row: rows.location, column: columns.location })
            }

            return 'none'
          }

          const previousEligible = toPreviousEligible({
            coordinates,
            loops,
            direction,
            toEligibility: index => toAbility(index) === 'enabled'
              ? toEligibility(index)
              : 'ineligible',
          })

          if (previousEligible !== 'none') {
            const { row: newRow, column: newColumn } = previousEligible
            rows.navigate(newRow)
            columns.navigate(newColumn)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api }),
        previousInRow: EligibleInPlaneNavigateApi['previousInRow'] = ({ row, column }, options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlaneNavigateApiOptions, ...options }

          return previous(
            { row, column },
            {
              direction: 'horizontal',
              toEligibility: ({ row: r, column: c }) => r === row && toEligibility({ row: r, column: c }) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        previousInColumn: EligibleInPlaneNavigateApi['previousInRow'] = ({ row, column }, options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlaneNavigateApiOptions, ...options }

          return previous(
            { row, column },
            {
              direction: 'vertical',
              toEligibility: ({ row: r, column: c }) => c === column && toEligibility({ row: r, column: c }) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        toAbility = ({ row, column }: Coordinates) => api.meta.value[row][column].ability || 'enabled'

  // TODO: Option or default to not trigger focus side effect after reordering, adding, or deleting
  onPlaneRendered(
    api.plane,
    {
      planeEffect: (currentSources, previousSources) => {
        const { 0: currentPlane } = currentSources,
              { 0: previousPlane } = previousSources

        if (
          !previousPlane?.length // Rendered
          || !currentPlane.length // Removed
          || (
            api.status.value.order === 'none'
            && api.status.value.rowWidth !== 'shortened'
            && api.status.value.columnHeight !== 'shortened'
          )
        ) return

        const points = [...currentPlane.points()],
              point = find<typeof points[0]>(
                ({ point: element }) => (
                  element === previousPlane.get({ row: rows.location, column: columns.location })
                )
              )(points) as typeof points[0],
              newLocation = point
                ? { row: point.row, column: point.column }
                : undefined,
              ability = newLocation ? exact(newLocation) : 'none'

        if (ability !== 'none') return

        if (
          api.status.value.rowWidth !== 'shortened'
          && api.status.value.columnHeight !== 'shortened'
        ) {
          first()
          return
        }

        if (
          api.status.value.rowWidth === 'shortened'
          && api.status.value.columnHeight !== 'shortened'
        ) {
          lastInRow(rows.location)
          return
        }

        if (
          api.status.value.rowWidth !== 'shortened'
          && api.status.value.columnHeight === 'shortened'
        ) {
          lastInColumn(columns.location)
          return
        }

        if (
          api.status.value.rowWidth === 'shortened'
          && api.status.value.columnHeight === 'shortened'
        ) {
          last()
          return
        }
      },
    }
  )

  return {
    exact,
    next,
    nextInRow,
    nextInColumn,
    previous,
    previousInRow,
    previousInColumn,
    first,
    last,
    firstInRow,
    lastInRow,
    firstInColumn,
    lastInColumn,
    random,
  }
}
