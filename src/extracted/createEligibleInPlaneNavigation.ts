import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { IdentifiedPlaneApi } from './useElementApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'

type BaseEligibleNavigationOptions = { toEligibility?: ToPlaneEligibility }

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInPlaneNavigation<Meta extends { ability: 'enabled' | 'disabled' }> (
  {
    rows,
    columns,
    plane,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    rows: ShallowReactive<Navigateable<HTMLElement[]>>,
    columns: ShallowReactive<Navigateable<HTMLElement>>,
    plane: IdentifiedPlaneApi<HTMLElement, Meta>,
    disabledElementsAreEligibleLocations: boolean,
    loops: boolean,
  }
): {
  exact: (row: number, column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  nextInRow: (row: number, column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  nextInColumn: (row: number, column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  previousInRow: (row: number, column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  previousInColumn: (row: number, column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  firstInRow: (row: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  lastInRow: (row: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  firstInColumn: (column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  lastInColumn: (column: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
} {
  const getAbility = (row: number, column: number) => plane.meta.value[row][column].ability || 'enabled',
        exact: ReturnType<typeof createEligibleInPlaneNavigation>['exact'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(plane.elements.value).navigate(row),
                c = new Navigateable(plane.elements.value[0]).navigate(column),
                eligibility = options.toEligibility(r.location, c.location)

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return getAbility(row, column)
          }

          if (getAbility(row, column) === 'enabled' && eligibility === 'eligible') {
            rows.navigate(row)
            columns.navigate(column)
            return 'enabled'
          }

          return 'none'
        },
        firstInRow: ReturnType<typeof createEligibleInPlaneNavigation>['firstInRow'] = (row, options = { toEligibility: () => 'eligible' }) => {
          return nextInRow(row, -1, options)
        },
        firstInColumn: ReturnType<typeof createEligibleInPlaneNavigation>['firstInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return nextInColumn(-1, column, options)
        },
        lastInRow: ReturnType<typeof createEligibleInPlaneNavigation>['lastInRow'] = (row, options = { toEligibility: () => 'eligible' }) => {
          return previousInRow(row, columns.array.length, options)
        },
        lastInColumn: ReturnType<typeof createEligibleInPlaneNavigation>['lastInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return previousInColumn(rows.array.length, column, options)
        },
        first: ReturnType<typeof createEligibleInPlaneNavigation>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = 0; row < rows.array.length; row++) {
            const a = nextInRow(row, -1, options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        last: ReturnType<typeof createEligibleInPlaneNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = rows.array.length - 1; row >= 0; row--) {
            const a = previousInRow(row, columns.array.length, options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        random: ReturnType<typeof createEligibleInPlaneNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(plane.elements.value).random(),
                c = new Navigateable(plane.elements.value[0]).random()

          if (options.toEligibility(r.location, c.location) === 'eligible') return exact(r.location, c.location)

          return 'none'
        },
        nextInRow: ReturnType<typeof createEligibleInPlaneNavigation>['nextInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return next('column', row, column, options)
        },
        nextInColumn: ReturnType<typeof createEligibleInPlaneNavigation>['nextInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return next('row', row, column, options)
        },
        next = (iterateOver: 'row' | 'column', row: number, column, options: BaseEligibleNavigationOptions = { toEligibility: () => 'eligible' }) => {
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
              ? toNextEligibleInColumn(row, column, options.toEligibility)
              : toNextEligibleInRow(row, column, options.toEligibility)
            
            if (Array.isArray(nextEligible)) {
              rows.navigate(nextEligible[0])
              columns.navigate(nextEligible[1])
              return getAbility(rows.location, columns.location)
            }
  
            return 'none'
          }

          const nextEligible = iterateOver === 'row'
            ? toNextEligibleInColumn(
              row, column,
              (r, c) => getAbility(r, c) === 'enabled'
                ? options.toEligibility(r, c)
                : 'ineligible',
            )
            : toNextEligibleInRow(
              row, column,
              (r, c) => getAbility(r, c) === 'enabled'
                ? options.toEligibility(r, c)
                : 'ineligible',
            )
            
          if (Array.isArray(nextEligible)) {
            rows.navigate(nextEligible[0])
            columns.navigate(nextEligible[1])
            return 'enabled'
          }

          return 'none'
        },
        toNextEligibleInRow = createToNextEligible({ plane, loops, iterateOver: 'column' }),
        toNextEligibleInColumn = createToNextEligible({ plane, loops, iterateOver: 'row' }),
        previousInRow: ReturnType<typeof createEligibleInPlaneNavigation>['previousInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return previous('column', row, column, options)
        },
        previousInColumn: ReturnType<typeof createEligibleInPlaneNavigation>['previousInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return previous('row', row, column, options)
        },
        previous = (iterateOver: 'row' | 'column', row: number, column, options: BaseEligibleNavigationOptions = { toEligibility: () => 'eligible' }) => {
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
              ? toPreviousEligibleInColumn(row, column, options.toEligibility)
              : toPreviousEligibleInRow(row, column, options.toEligibility)
            
            if (Array.isArray(previousEligible)) {
              rows.navigate(previousEligible[0])
              columns.navigate(previousEligible[1])
              return getAbility(rows.location, columns.location)
            }
  
            return 'none'
          }
          
          const previousEligible = iterateOver === 'row'
            ? toPreviousEligibleInColumn(
              row, column,
              (r, c) => getAbility(r, c) === 'enabled'
                ? options.toEligibility(r, c)
                : 'ineligible',
            )
            : toPreviousEligibleInRow(
              row, column,
              (r, c) => getAbility(r, c) === 'enabled'
                ? options.toEligibility(r, c)
                : 'ineligible',
            )
        
          if (Array.isArray(previousEligible)) {
            rows.navigate(previousEligible[0])
            columns.navigate(previousEligible[1])
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligibleInRow = createToPreviousEligible({ plane, loops, iterateOver: 'column' }),
        toPreviousEligibleInColumn = createToPreviousEligible({ plane, loops, iterateOver: 'row' })

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
  // TODO: Watch meta?
  watch(
    [plane.status, plane.elements],
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
          exact(newRow, newColumn)
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
