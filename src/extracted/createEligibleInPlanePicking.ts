import { isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { createFilter, createReduce, Pickable } from '@baleada/logic'
import type { IdentifiedPlaneApi } from './useElementApi'
import { ensureWatchSources } from './ensureWatchSources'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToEligibility } from './createToEligibleInPlane'

type BaseEligiblePickingOptions = { toEligibility?: ToEligibility }

const defaultEligiblePickingOptions: BaseEligiblePickingOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements in a plane that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInPlanePicking (
  { rows, columns, ability, elementsApi }: {
    rows: Ref<Pickable<HTMLElement[]>>,
    columns: Ref<Pickable<HTMLElement>>,
    ability: StatusOption<IdentifiedPlaneApi<HTMLElement>['elements'], 'enabled' | 'disabled'>,
    elementsApi: IdentifiedPlaneApi<HTMLElement>,
  }
): {
  exact: (rowOrRows: number | number[], columnOrColumns: number | number[], options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  nextInRow: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  nextInColumn: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previousInRow: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previousInColumn: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const getAbility = ensureGetStatus(elementsApi.elements, ability),
        exact: ReturnType<typeof createEligibleInPlanePicking>['exact'] = (rowOrRows, columnOrColumns, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'disabled')
            || (isRef(ability) && ability.value === 'disabled')
          ) {
            return 'none'
          }

          if (
            (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const r = new Pickable(rows.value.array).pick(rowOrRows),
                  c = new Pickable(columns.value.array).pick(columnOrColumns)
              
            const eligibleRows = createFilter<number>((row, index) => toEligibility(row, c.picks[index]) === 'eligible')(r.picks),
                  eligibleColumns = createFilter<number>((column, index) => toEligibility(r.picks[index], column) === 'eligible')(c.picks)
            
            rows.value.pick(eligibleRows, pickOptions)
            columns.value.pick(eligibleColumns, pickOptions)
            return 'enabled'
          }

          const r = new Pickable(rows.value.array).pick(rowOrRows),
                c = new Pickable(columns.value.array).pick(columnOrColumns)
            
          const eligibleRows = createFilter<number>((row, index) =>
                  getAbility(row, c.picks[index]) === 'enabled'
                  && toEligibility(row, c.picks[index]) === 'eligible'
                )(r.picks),
                eligibleColumns = createFilter<number>((column, index) =>
                  getAbility(r.picks[index], column) === 'enabled'
                  && toEligibility(r.picks[index], column) === 'eligible'
                )(c.picks)

          if (eligibleRows.length > 0) {
            rows.value.pick(eligibleRows, pickOptions)
            columns.value.pick(eligibleColumns, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        nextInRow: ReturnType<typeof createEligibleInPlanePicking>['nextInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return next('column', row, column, options)
        },
        nextInColumn: ReturnType<typeof createEligibleInPlanePicking>['nextInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return next('row', row, column, options)
        },
        next = (iterateOver: 'row' | 'column', row: number, column: number, options: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1] = {}) => {
          switch(iterateOver) {
            case 'row':
              if (row === rows.value.array.length - 1) return 'none'
              break
            case 'column':
              if (column === columns.value.array.length - 1) return 'none'
              break
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const nextEligible = iterateOver === 'row'
              ? toNextEligibleInColumn(row, column, options.toEligibility)
              : toNextEligibleInRow(row, column, options.toEligibility)
            
            if (Array.isArray(nextEligible)) {
              rows.value.pick(nextEligible[0], pickOptions)
              columns.value.pick(nextEligible[1], pickOptions)
              return 'enabled'
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
            rows.value.pick(nextEligible[0], pickOptions)
            columns.value.pick(nextEligible[1], pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligibleInRow = createToNextEligible({ elementsApi, loops: false, iterateOver: 'column' }),
        toNextEligibleInColumn = createToNextEligible({ elementsApi, loops: false, iterateOver: 'row' }),
        previousInRow: ReturnType<typeof createEligibleInPlanePicking>['previousInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return previous('column', row, column, options)
        },
        previousInColumn: ReturnType<typeof createEligibleInPlanePicking>['previousInRow'] = (row, column, options = { toEligibility: () => 'eligible' }) => {
          return previous('row', row, column, options)
        },
        previous = (iterateOver: 'row' | 'column', row: number, column: number, options: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1] = {}) => {
          switch(iterateOver) {
            case 'row':
              if (row === 0) return 'none'
              break
            case 'column':
              if (column === 0) return 'none'
              break
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'enabled')
            || (isRef(ability) && ability.value === 'enabled')
          ) {
            const previousEligible = iterateOver === 'row'
              ? toPreviousEligibleInColumn(row, column, options.toEligibility)
              : toPreviousEligibleInRow(row, column, options.toEligibility)
            
            if (Array.isArray(previousEligible)) {
              rows.value.pick(previousEligible[0], pickOptions)
              columns.value.pick(previousEligible[1], pickOptions)
              return 'enabled'
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
            rows.value.pick(previousEligible[0], pickOptions)
            columns.value.pick(previousEligible[1], pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligibleInRow = createToPreviousEligible({ elementsApi, loops: false, iterateOver: 'column' }),
        toPreviousEligibleInColumn = createToPreviousEligible({ elementsApi, loops: false, iterateOver: 'row' })

  if (isRef(ability)) {
    watch(
      ability,
      () => {
        if (ability.value === 'disabled') {
          rows.value.omit()
          columns.value.omit()
        }
      }
    )
  } else if (typeof ability !== 'string' && typeof ability !== 'function') {
    watch(
      ensureWatchSources(ability.watchSource),
      () => {
        const positions: [row: number, column: number][] = []

        for (let row = 0; row < rows.value.array.length; row++) {
          for (let column = 0; column < columns.value.array.length; column++) {
            positions.push([row, column])
          }
        }

        const p = new Pickable(positions)

        for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
          const indexInPositions = findIndex(
            ([row, column]) => row === rows.value.picks[rowPick] && column === columns.value.picks[rowPick]
          )(positions) as number
          
          p.pick(indexInPositions)
        }

        for (const pick of p.picks) {
          const [row, column] = p.array[pick]
          if (ability.get(row, column) === 'disabled') {
            p.omit(pick)
          }
        }

        const newRows: number[] = [],
              newColumns: number[] = []

        for (const pick of p.picks) {
          const [row, column] = p.array[pick]
          newRows.push(row)
          newColumns.push(column)
        }

        rows.value.pick(newRows, { replace: 'all' })
        columns.value.pick(newColumns, { replace: 'all' })
      }
    )
  }

  watch(
    [elementsApi.status, elementsApi.elements],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements } = currentSources,
            { 1: previousElements } = previousSources

      if (status.order === 'changed') {
        const withPositions: [position: [row: number, column: number], element: HTMLElement][] = []

        for (let row = 0; row < rows.value.array.length; row++) {
          for (let column = 0; column < columns.value.array.length; column++) {
            withPositions.push([[row, column], currentElements[row][column]])
          }
        }

        const newRows: number[] = [],
              newColumns: number[] = []

        for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
          const indexInWithPositions = findIndex<typeof withPositions[0]>(
            ([_, element]) => element.isSameNode(previousElements[rows.value.picks[rowPick]][columns.value.picks[rowPick]])
          )(withPositions) as number

          if (typeof indexInWithPositions === 'number') {
            const [row, column] = withPositions[indexInWithPositions][0]
            newRows.push(row)
            newColumns.push(column)
          }
        }

        exact(newRows, newColumns, { replace: 'all' })

        return
      }

      if (status.rowLength === 'shortened' || status.columnLength === 'shortened') {
        const newRows: number[] = [],
              newColumns: number[] = []

        if (status.rowLength === 'shortened' && status.columnLength === 'shortened') {
          for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
            if (
              rows.value.picks[rowPick] < rows.value.array.length
              && columns.value.picks[rowPick] < columns.value.array.length
            ) {
              newRows.push(rows.value.picks[rowPick])
              newColumns.push(columns.value.picks[rowPick])
            }
          }

          exact(newRows, newColumns, { replace: 'all' })
          return
        }
        
        if (status.rowLength === 'shortened') {
          for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
            if (rows.value.picks[rowPick] < currentElements.length) {
              newRows.push(rows.value.picks[rowPick])
              newColumns.push(columns.value.picks[rowPick])
            }
          }
          
          exact(newRows, newColumns, { replace: 'all' })
          return
        }
        
        if (status.columnLength === 'shortened') {
          for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
            if (columns.value.picks[rowPick] < currentElements[rows.value.picks[rowPick]].length) {
              newRows.push(rows.value.picks[rowPick])
              newColumns.push(columns.value.picks[rowPick])
            }
          }
          
          exact(newRows, newColumns, { replace: 'all' })
          return
        }
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
  }
}