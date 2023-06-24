import type { Ref } from 'vue'
import { createFilter, Pickable } from '@baleada/logic'
import type { IdentifiedPlaneApi } from './useElementApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'

type BaseEligiblePickingOptions = { toEligibility?: ToPlaneEligibility }

const defaultEligiblePickingOptions: BaseEligiblePickingOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements in a plane that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInPlanePicking<Meta extends { ability: 'enabled' | 'disabled' }> (
  { rows, columns, plane }: {
    rows: Ref<Pickable<HTMLElement[]>>,
    columns: Ref<Pickable<HTMLElement>>,
    plane: IdentifiedPlaneApi<HTMLElement, Meta>,
  }
): {
  exact: (rowOrRows: number | number[], columnOrColumns: number | number[], options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  nextInRow: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  nextInColumn: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previousInRow: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previousInColumn: (row: number, column: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  all: (options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const getAbility = (row: number, column: number) => plane.meta.value[row]?.[column]?.ability || 'enabled',
        exact: ReturnType<typeof createEligibleInPlanePicking>['exact'] = (rowOrRows, columnOrColumns, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options },
                r = new Pickable(rows.value.array).pick(rowOrRows),
                c = new Pickable(columns.value.array).pick(columnOrColumns),
                eligibleRows = createFilter<number>((row, index) =>
                  getAbility(row, c.picks[index]) === 'enabled'
                  && toEligibility(row, c.picks[index]) === 'eligible'
                )(r.picks),
                eligibleColumns = createFilter<number>((column, index) =>
                  getAbility(r.picks[index], column) === 'enabled'
                  && toEligibility(r.picks[index], column) === 'eligible'
                )(c.picks)

          if (eligibleRows.length > 0) {
            rows.value.pick(eligibleRows, { ...pickOptions, allowsDuplicates: true })
            columns.value.pick(eligibleColumns, { ...pickOptions, allowsDuplicates: true })
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

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options },
                nextEligible = iterateOver === 'row'
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
            rows.value.pick(nextEligible[0], { ...pickOptions, allowsDuplicates: true })
            columns.value.pick(nextEligible[1], { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toNextEligibleInRow = createToNextEligible({ plane, loops: false, iterateOver: 'column' }),
        toNextEligibleInColumn = createToNextEligible({ plane, loops: false, iterateOver: 'row' }),
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

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options },
                previousEligible = iterateOver === 'row'
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
            rows.value.pick(previousEligible[0], { ...pickOptions, allowsDuplicates: true })
            columns.value.pick(previousEligible[1], { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligibleInRow = createToPreviousEligible({ plane, loops: false, iterateOver: 'column' }),
        toPreviousEligibleInColumn = createToPreviousEligible({ plane, loops: false, iterateOver: 'row' }),
        all: ReturnType<typeof createEligibleInPlanePicking>['all'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligiblePickingOptions, ...options },
                newRows: number[] = [],
                newColumns: number[] = []

          for (let r = 0; r < rows.value.array.length; r++) {
            for (let c = 0; c < columns.value.array.length; c++) {
              if (getAbility(r, c) === 'enabled' && toEligibility(r, c) === 'eligible') {
                newRows.push(r)
                newColumns.push(c)
              }
            }
          }

          if (newRows.length > 0) {
            rows.value.pick(newRows, { allowsDuplicates: true })
            columns.value.pick(newColumns, { allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        }

  // if (isRef(ability)) {
  //   watch(
  //     ability,
  //     () => {
  //       if (ability.value === 'disabled') {
  //         rows.value.omit()
  //         columns.value.omit()
  //       }
  //     }
  //   )
  // } else if (typeof ability !== 'string' && typeof ability !== 'function') {
  //   watch(
  //     narrowWatchSources(ability.watchSource),
  //     () => {
  //       const r = new Pickable(rows.value.array).pick(rows.value.picks),
  //             c = new Pickable(columns.value.array).pick(columns.value.picks)

  //       for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
  //         if (ability.get(r.picks[rowPick], c.picks[rowPick]) === 'disabled') {
  //           r.omit(rowPick, { reference: 'picks' })
  //           c.omit(rowPick, { reference: 'picks' })
  //         }
  //       }

  //       if (r.picks.length !== rows.value.picks.length) {
  //         rows.value.pick(r.picks, { replace: 'all' })
  //         columns.value.pick(c.picks, { replace: 'all' })
  //       }
  //     }
  //   )
  // }

  // watch(
  //   [plane.status, plane.elements, plane.meta],
  //   (currentSources, previousSources) => {
  //     const { 0: status, 1: currentElements } = currentSources,
  //           { 1: previousElements } = previousSources

  //     if (!currentElements.length) return // Conditionally removed

  //     if (status.order === 'changed') {
  //       const withPositions: [position: [row: number, column: number], element: HTMLElement][] = []

  //       for (let row = 0; row < rows.value.array.length; row++) {
  //         for (let column = 0; column < columns.value.array.length; column++) {
  //           withPositions.push([[row, column], currentElements[row][column]])
  //         }
  //       }

  //       const newRows: number[] = [],
  //             newColumns: number[] = []

  //       for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
  //         const indexInWithPositions = findIndex<typeof withPositions[0]>(
  //           ([_, element]) => element === previousElements[rows.value.picks[rowPick]][columns.value.picks[rowPick]]
  //         )(withPositions) as number

  //         if (typeof indexInWithPositions === 'number') {
  //           const [row, column] = withPositions[indexInWithPositions][0]
  //           newRows.push(row)
  //           newColumns.push(column)
  //         }
  //       }

  //       exact(newRows, newColumns, { replace: 'all', allowsDuplicates: true })

  //       return
  //     }

  //     if (status.rowLength === 'shortened' || status.columnLength === 'shortened') {
  //       const newRows: number[] = [],
  //             newColumns: number[] = []

  //       if (status.rowLength === 'shortened' && status.columnLength === 'shortened') {
  //         for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
  //           if (
  //             rows.value.picks[rowPick] < rows.value.array.length
  //             && columns.value.picks[rowPick] < columns.value.array.length
  //           ) {
  //             newRows.push(rows.value.picks[rowPick])
  //             newColumns.push(columns.value.picks[rowPick])
  //           }
  //         }

  //         exact(newRows, newColumns, { replace: 'all', allowsDuplicates: true })
  //         return
  //       }
        
  //       if (status.rowLength === 'shortened') {
  //         for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
  //           if (rows.value.picks[rowPick] < currentElements.length) {
  //             newRows.push(rows.value.picks[rowPick])
  //             newColumns.push(columns.value.picks[rowPick])
  //           }
  //         }
          
  //         exact(newRows, newColumns, { replace: 'all', allowsDuplicates: true })
  //         return
  //       }
        
  //       if (status.columnLength === 'shortened') {
  //         for (let rowPick = 0; rowPick < rows.value.picks.length; rowPick++) {
  //           if (columns.value.picks[rowPick] < currentElements[rows.value.picks[rowPick]].length) {
  //             newRows.push(rows.value.picks[rowPick])
  //             newColumns.push(columns.value.picks[rowPick])
  //           }
  //         }
          
  //         exact(newRows, newColumns, { replace: 'all', allowsDuplicates: true })
  //         return
  //       }
  //     }
  //   },
  //   { flush: 'post' }
  // )

  return {
    exact,
    nextInRow,
    nextInColumn,
    previousInRow,
    previousInColumn,
    all,
  }
}
