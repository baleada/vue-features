import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import type { Ability } from './ability'

export type EligibleInPlaneNavigateApi = {
  exact: (coordinates: [row: number, column: number], options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  next: (coordinates: [row: number, column: number], options?: EligibleInPlaneNavigateNextPreviousOptions) => Ability | 'none',
  nextInRow: (coordinates: [row: number, column: number], options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  nextInColumn: (coordinates: [row: number, column: number], options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  previous: (coordinates: [row: number, column: number], options?: EligibleInPlaneNavigateNextPreviousOptions) => Ability | 'none',
  previousInRow: (coordinates: [row: number, column: number], options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  previousInColumn: (coordinates: [row: number, column: number], options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  first: (options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  last: (options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  firstInRow: (row: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  lastInRow: (row: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  firstInColumn: (column: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  lastInColumn: (column: number, options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
  random: (options?: BaseEligibleInPlaneNavigateApiOptions) => Ability | 'none',
}

type BaseEligibleInPlaneNavigateApiOptions = { toEligibility?: ToPlaneEligibility }

type EligibleInPlaneNavigateNextPreviousOptions = BaseEligibleInPlaneNavigateApiOptions & { direction?: 'vertical' | 'horizontal' }

const defaultEligibleInPlaneNavigateNextPreviousOptions: EligibleInPlaneNavigateNextPreviousOptions = {
  direction: 'horizontal',
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInPlaneNavigateApi<Meta extends { ability?: Ability }> (
  {
    rows,
    columns,
    api,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    rows: ShallowReactive<Navigateable<HTMLElement[]>>,
    columns: ShallowReactive<Navigateable<HTMLElement>>,
    api: PlaneApi<HTMLElement, true, Meta>,
    disabledElementsAreEligibleLocations: boolean,
    loops: boolean,
  }
): EligibleInPlaneNavigateApi {
  const exact: EligibleInPlaneNavigateApi['exact'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(api.plane.value).navigate(row),
                c = new Navigateable(api.plane.value[0]).navigate(column),
                eligibility = options.toEligibility([r.location, c.location])

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return toAbility([row, column])
          }

          if (toAbility([row, column]) === 'enabled' && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return 'enabled'
          }

          return 'none'
        },
        firstInRow: EligibleInPlaneNavigateApi['firstInRow'] = (row, options = { toEligibility: () => 'eligible' }) => {
          return nextInRow([row, -1], options)
        },
        firstInColumn: EligibleInPlaneNavigateApi['firstInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return nextInColumn([-1, column], options)
        },
        lastInRow: EligibleInPlaneNavigateApi['lastInRow'] = (row, options = { toEligibility: () => 'eligible' }) => {
          return previousInRow([row, columns.array.length], options)
        },
        lastInColumn: EligibleInPlaneNavigateApi['lastInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return previousInColumn([rows.array.length, column], options)
        },
        first: EligibleInPlaneNavigateApi['first'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = 0; row < rows.array.length; row++) {
            const a = nextInRow([row, -1], options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        last: EligibleInPlaneNavigateApi['last'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = rows.array.length - 1; row >= 0; row--) {
            const a = previousInRow([row, columns.array.length], options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        random: EligibleInPlaneNavigateApi['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(api.plane.value).random(),
                c = new Navigateable(api.plane.value[0]).random()

          if (options.toEligibility([r.location, c.location]) === 'eligible') return exact([r.location, c.location])

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
            
            if (Array.isArray(nextEligible)) {
              const [newRow, newColumn] = nextEligible
              rows.navigate(newRow)
              columns.navigate(newColumn)
              return toAbility([rows.location, columns.location])
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
            
          if (Array.isArray(nextEligible)) {
            const [newRow, newColumn] = nextEligible
            rows.navigate(newRow)
            columns.navigate(newColumn)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api }),
        nextInRow: EligibleInPlaneNavigateApi['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return next(
            [row, column],
            {
              direction: 'horizontal',
              toEligibility: ([r, c]) => r === row && options.toEligibility([r, c]) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        nextInColumn: EligibleInPlaneNavigateApi['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return next(
            [row, column],
            {
              direction: 'vertical',
              toEligibility: ([r, c]) => c === column && options.toEligibility([r, c]) === 'eligible'
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
            
            if (Array.isArray(previousEligible)) {
              const [newRow, newColumn] = previousEligible
              rows.navigate(newRow)
              columns.navigate(newColumn)
              return toAbility([rows.location, columns.location])
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
            
          if (Array.isArray(previousEligible)) {
            const [newRow, newColumn] = previousEligible
            rows.navigate(newRow)
            columns.navigate(newColumn)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api }),
        previousInRow: EligibleInPlaneNavigateApi['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return previous(
            [row, column],
            {
              direction: 'horizontal',
              toEligibility: ([r, c]) => r === row && options.toEligibility([r, c]) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        previousInColumn: EligibleInPlaneNavigateApi['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return previous(
            [row, column],
            {
              direction: 'vertical',
              toEligibility: ([r, c]) => c === column && options.toEligibility([r, c]) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        toAbility = ([row, column]: [row: number, column: number]) => api.meta.value[row][column].ability || 'enabled'

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
  watch(
    [api.status, api.plane],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources

      if (status.rowLength === 'shortened' || status.columnLength === 'shortened') {
        if (status.rowLength === 'shortened' && columns.location > currentElements.length - 1) {
          lastInRow(rows.location)
        }

        if (status.columnLength === 'shortened' && rows.location > currentElements.length - 1) {
          lastInColumn(columns.location)
        }
        
        return
      }
      
      if (status.order === 'changed') {
        const { 1: previousElements } = previousSources
        let newRow: number, newColumn: number
        
        for (let row = 0; row < rows.array.length; row++) {
          for (let column = 0; column < columns.array.length; column++) {
            if (!previousElements?.[row]?.[column]) continue
            if (currentElements[row][column] === previousElements[row][column]) {
              newRow = row
              newColumn = column
              break
            }
          }
        }

        if (typeof newRow === 'number' && typeof newColumn === 'number') {
          exact([newRow, newColumn])
          return
        }

        first()
        return
      }
    },
    { flush: 'post' }
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
