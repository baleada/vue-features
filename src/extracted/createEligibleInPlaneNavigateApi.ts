import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'

type BaseEligibleNavigateApiOptions = { toEligibility?: ToPlaneEligibility }

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInPlaneNavigateApi<Meta extends { ability?: 'enabled' | 'disabled' }> (
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
): {
  exact: (coordinates: [row: number, column: number], options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  nextInRow: (coordinates: [row: number, column: number], options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  nextInColumn: (coordinates: [row: number, column: number], options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  previousInRow: (coordinates: [row: number, column: number], options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  previousInColumn: (coordinates: [row: number, column: number], options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  firstInRow: (row: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  lastInRow: (row: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  firstInColumn: (column: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  lastInColumn: (column: number, options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleNavigateApiOptions) => 'enabled' | 'disabled' | 'none',
} {
  const getAbility = ([row, column]: [row: number, column: number]) => api.meta.value[row][column].ability || 'enabled',
        exact: ReturnType<typeof createEligibleInPlaneNavigateApi>['exact'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(api.plane.value).navigate(row),
                c = new Navigateable(api.plane.value[0]).navigate(column),
                eligibility = options.toEligibility([r.location, c.location])

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return getAbility([row, column])
          }

          if (getAbility([row, column]) === 'enabled' && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return 'enabled'
          }

          return 'none'
        },
        firstInRow: ReturnType<typeof createEligibleInPlaneNavigateApi>['firstInRow'] = (row, options = { toEligibility: () => 'eligible' }) => {
          return nextInRow([row, -1], options)
        },
        firstInColumn: ReturnType<typeof createEligibleInPlaneNavigateApi>['firstInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return nextInColumn([-1, column], options)
        },
        lastInRow: ReturnType<typeof createEligibleInPlaneNavigateApi>['lastInRow'] = (row, options = { toEligibility: () => 'eligible' }) => {
          return previousInRow([row, columns.array.length], options)
        },
        lastInColumn: ReturnType<typeof createEligibleInPlaneNavigateApi>['lastInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return previousInColumn([rows.array.length, column], options)
        },
        first: ReturnType<typeof createEligibleInPlaneNavigateApi>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = 0; row < rows.array.length; row++) {
            const a = nextInRow([row, -1], options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        last: ReturnType<typeof createEligibleInPlaneNavigateApi>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = rows.array.length - 1; row >= 0; row--) {
            const a = previousInRow([row, columns.array.length], options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        random: ReturnType<typeof createEligibleInPlaneNavigateApi>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(api.plane.value).random(),
                c = new Navigateable(api.plane.value[0]).random()

          if (options.toEligibility([r.location, c.location]) === 'eligible') return exact([r.location, c.location])

          return 'none'
        },
        nextInRow: ReturnType<typeof createEligibleInPlaneNavigateApi>['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return next('column', row, column, options)
        },
        nextInColumn: ReturnType<typeof createEligibleInPlaneNavigateApi>['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return next('row', row, column, options)
        },
        next = (iterateOver: 'row' | 'column', row: number, column, options: BaseEligibleNavigateApiOptions = { toEligibility: () => 'eligible' }) => {
          switch(iterateOver) {
            case 'row':
              if (!loops && row === rows.array.length - 1) return 'none'
              break
            case 'column':
              if (!loops && column === columns.array.length - 1) return 'none'
              break
          }
          
          if (disabledElementsAreEligibleLocations) {
            const nextEligible = iterateOver === 'row'
              ? toNextEligibleInColumn([row, column], options.toEligibility)
              : toNextEligibleInRow([row, column], options.toEligibility)
            
            if (Array.isArray(nextEligible)) {
              rows.navigate(nextEligible[0])
              columns.navigate(nextEligible[1])
              return getAbility([rows.location, columns.location])
            }
  
            return 'none'
          }

          const nextEligible = iterateOver === 'row'
            ? toNextEligibleInColumn(
              [row, column],
              ([r, c]) => getAbility([r, c]) === 'enabled'
                ? options.toEligibility([r, c])
                : 'ineligible',
            )
            : toNextEligibleInRow(
              [row, column],
              ([r, c]) => getAbility([r, c]) === 'enabled'
                ? options.toEligibility([r, c])
                : 'ineligible',
            )
            
          if (Array.isArray(nextEligible)) {
            rows.navigate(nextEligible[0])
            columns.navigate(nextEligible[1])
            return 'enabled'
          }

          return 'none'
        },
        toNextEligibleInRow = createToNextEligible({ api: api, loops, iterateOver: 'column' }),
        toNextEligibleInColumn = createToNextEligible({ api: api, loops, iterateOver: 'row' }),
        previousInRow: ReturnType<typeof createEligibleInPlaneNavigateApi>['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return previous('column', row, column, options)
        },
        previousInColumn: ReturnType<typeof createEligibleInPlaneNavigateApi>['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return previous('row', row, column, options)
        },
        previous = (iterateOver: 'row' | 'column', row: number, column, options: BaseEligibleNavigateApiOptions = { toEligibility: () => 'eligible' }) => {
          switch(iterateOver) {
            case 'row':
              if (!loops && row === 0) return 'none'
              break
            case 'column':
              if (!loops && column === 0) return 'none'
              break
          }

          if (disabledElementsAreEligibleLocations) {
            const previousEligible = iterateOver === 'row'
              ? toPreviousEligibleInColumn([row, column], options.toEligibility)
              : toPreviousEligibleInRow([row, column], options.toEligibility)
            
            if (Array.isArray(previousEligible)) {
              rows.navigate(previousEligible[0])
              columns.navigate(previousEligible[1])
              return getAbility([rows.location, columns.location])
            }
  
            return 'none'
          }
          
          const previousEligible = iterateOver === 'row'
            ? toPreviousEligibleInColumn(
              [row, column],
              ([r, c]) => getAbility([r, c]) === 'enabled'
                ? options.toEligibility([r, c])
                : 'ineligible',
            )
            : toPreviousEligibleInRow(
              [row, column],
              ([r, c]) => getAbility([r, c]) === 'enabled'
                ? options.toEligibility([r, c])
                : 'ineligible',
            )
        
          if (Array.isArray(previousEligible)) {
            rows.navigate(previousEligible[0])
            columns.navigate(previousEligible[1])
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligibleInRow = createToPreviousEligible({ api: api, loops, iterateOver: 'column' }),
        toPreviousEligibleInColumn = createToPreviousEligible({ api: api, loops, iterateOver: 'row' })

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
  // TODO: Watch meta?
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
    nextInRow,
    nextInColumn,
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
