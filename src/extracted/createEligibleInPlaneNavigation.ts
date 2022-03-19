import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { Navigateable } from '@baleada/logic'
import type { IdentifiedPlaneApi } from './useElementApi'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToEligibility } from './createToEligibleInPlane'
import type { Plane } from './ensureReactivePlane'

type BaseEligibleNavigationOptions = { toEligibility?: ToEligibility }

/**
 * Creates methods for navigating only to elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleInPlaneNavigation (
  {
    rows,
    columns,
    ability,
    elementsApi,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    rows: Ref<Navigateable<HTMLElement[]>>,
    columns: Ref<Navigateable<HTMLElement>>,
    ability: StatusOption<Ref<Plane<HTMLElement>>, 'enabled' | 'disabled'>,
    elementsApi: IdentifiedPlaneApi<HTMLElement>,
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
  const getAbility = ensureGetStatus(elementsApi.elements, ability),
        exact: ReturnType<typeof createEligibleInPlaneNavigation>['exact'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(elementsApi.elements.value).navigate(row),
                c = new Navigateable(elementsApi.elements.value[0]).navigate(column),
                eligibility = options.toEligibility(r.location, c.location)

          if (disabledElementsAreEligibleLocations && eligibility === 'eligible') {
            rows.value.navigate(row)
            columns.value.navigate(column)
            return getAbility(row, column)
          }

          if (getAbility(row, column) === 'enabled' && eligibility === 'eligible') {
            rows.value.navigate(row)
            columns.value.navigate(column)
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
          return previousInRow(row, columns.value.array.length, options)
        },
        lastInColumn: ReturnType<typeof createEligibleInPlaneNavigation>['lastInColumn'] = (column, options = { toEligibility: () => 'eligible' }) => {
          return previousInColumn(rows.value.array.length, column, options)
        },
        first: ReturnType<typeof createEligibleInPlaneNavigation>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = 0; row < rows.value.array.length; row++) {
            const a = nextInRow(row, -1, options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        last: ReturnType<typeof createEligibleInPlaneNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          for (let row = rows.value.array.length - 1; row >= 0; row--) {
            const a = previousInRow(row, columns.value.array.length, options)
            if (a !== 'none') return a
          }

          return 'none'
        },
        random: ReturnType<typeof createEligibleInPlaneNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const r = new Navigateable(elementsApi.elements.value).random(),
                c = new Navigateable(elementsApi.elements.value[0]).random()

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
              if (!loops && row === rows.value.array.length - 1) return 'none'
              break
            case 'column':
              if (!loops && column === columns.value.array.length - 1) return 'none'
              break
          }
          
          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextEligible = iterateOver === 'row'
              ? toNextEligibleInColumn(row, column, options.toEligibility)
              : toNextEligibleInRow(row, column, options.toEligibility)
            
            if (Array.isArray(nextEligible)) {
              rows.value.navigate(nextEligible[0])
              columns.value.navigate(nextEligible[1])
              return getAbility(rows.value.location, columns.value.location)
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
            rows.value.navigate(nextEligible[0])
            columns.value.navigate(nextEligible[1])
            return 'enabled'
          }

          return 'none'
        },
        toNextEligibleInRow = createToNextEligible({ elementsApi, loops, iterateOver: 'column' }),
        toNextEligibleInColumn = createToNextEligible({ elementsApi, loops, iterateOver: 'row' }),
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

          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousEligible = iterateOver === 'row'
              ? toPreviousEligibleInColumn(row, column, options.toEligibility)
              : toPreviousEligibleInRow(row, column, options.toEligibility)
            
            if (Array.isArray(previousEligible)) {
              rows.value.navigate(previousEligible[0])
              columns.value.navigate(previousEligible[1])
              return getAbility(rows.value.location, columns.value.location)
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
            rows.value.navigate(previousEligible[0])
            columns.value.navigate(previousEligible[1])
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligibleInRow = createToPreviousEligible({ elementsApi, loops, iterateOver: 'column' }),
        toPreviousEligibleInColumn = createToPreviousEligible({ elementsApi, loops, iterateOver: 'row' })

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
  watch(
    [elementsApi.status, elementsApi.elements],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources

      if (status.rowLength === 'shortened' || status.columnLength === 'shortened') {
        if (status.rowLength === 'shortened' && columns.value.location > currentElements.length - 1) {
          lastInRow(rows.value.location)
        }

        if (status.columnLength === 'shortened' && rows.value.location > currentElements.length - 1) {
          lastInColumn(columns.value.location)
        }
        
        return
      }
      
      if (status.order === 'changed') {
        const { 1: previousElements } = previousSources
        let newRow: number, newColumn: number
        
        for (let row = 0; row < rows.value.array.length; row++) {
          for (let column = 0; column < columns.value.array.length; column++) {
            if (!previousElements?.[row]?.[column]) continue
            if (currentElements[row][column].isSameNode(previousElements[row][column])) {
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
