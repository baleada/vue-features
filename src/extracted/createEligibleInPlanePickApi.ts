import type { ShallowReactive } from 'vue'
import { createFilter, createMap, Pickable } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'

type BaseEligiblePickApiOptions = { toEligibility?: ToPlaneEligibility }

const defaultEligiblePickApiOptions: BaseEligiblePickApiOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements in a plane that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInPlanePickApi<Meta extends { ability?: 'enabled' | 'disabled' }> (
  { rows, columns, api }: {
    rows: ShallowReactive<Pickable<HTMLElement[]>>,
    columns: ShallowReactive<Pickable<HTMLElement>>,
    api: PlaneApi<HTMLElement, true, Meta>,
  }
): {
  exact: (coordinatesOrCoordinateList: [row: number, column: number] | [row: number, column: number][], options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  nextInRow: (coordinates: [row: number, column: number], options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  nextInColumn: (coordinates: [row: number, column: number], options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previousInRow: (coordinates: [row: number, column: number], options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previousInColumn: (coordinates: [row: number, column: number], options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  all: (options?: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const getAbility = ([row, column]: [row: number, column: number]) => api.meta.value[row][column].ability || 'enabled',
        exact: ReturnType<typeof createEligibleInPlanePickApi>['exact'] = (coordinatesOrCoordinatesList, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                coordinatesList = Array.isArray(coordinatesOrCoordinatesList[0])
                  ? coordinatesOrCoordinatesList as [row: number, column: number][]
                  : [coordinatesOrCoordinatesList] as [row: number, column: number][],
                newRowPicks = toRows(coordinatesList),
                newColumnPicks = toColumns(coordinatesList),
                r = new Pickable(rows.array).pick(newRowPicks),
                c = new Pickable(columns.array).pick(newColumnPicks),
                eligibleRows = createFilter<number>((row, index) =>
                  getAbility([row, c.picks[index]]) === 'enabled'
                  && toEligibility([row, c.picks[index]]) === 'eligible'
                )(r.picks),
                eligibleColumns = createFilter<number>((column, index) =>
                  getAbility([r.picks[index], column]) === 'enabled'
                  && toEligibility([r.picks[index], column]) === 'eligible'
                )(c.picks)

          if (eligibleRows.length > 0) {
            rows.pick(eligibleRows, { ...pickOptions, allowsDuplicates: true })
            columns.pick(eligibleColumns, { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        nextInRow: ReturnType<typeof createEligibleInPlanePickApi>['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return next('column', [row, column], options)
        },
        nextInColumn: ReturnType<typeof createEligibleInPlanePickApi>['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return next('row', [row, column], options)
        },
        next = (
          iterateOver: 'row' | 'column',
          [row, column]: [row: number, column: number],
          options: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1] = {}
        ) => {
          switch(iterateOver) {
            case 'row':
              if (row === rows.array.length - 1) return 'none'
              break
            case 'column':
              if (column === columns.array.length - 1) return 'none'
              break
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                nextEligible = iterateOver === 'row'
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
            rows.pick(nextEligible[0], { ...pickOptions, allowsDuplicates: true })
            columns.pick(nextEligible[1], { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toNextEligibleInRow = createToNextEligible({ api: api, loops: false, iterateOver: 'column' }),
        toNextEligibleInColumn = createToNextEligible({ api: api, loops: false, iterateOver: 'row' }),
        previousInRow: ReturnType<typeof createEligibleInPlanePickApi>['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return previous('column', [row, column], options)
        },
        previousInColumn: ReturnType<typeof createEligibleInPlanePickApi>['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
          return previous('row', [row, column], options)
        },
        previous = (
          iterateOver: 'row' | 'column',
          [row, column]: [row: number, column: number],
          options: BaseEligiblePickApiOptions & Parameters<Pickable<HTMLElement>['pick']>[1] = {}
        ) => {
          switch(iterateOver) {
            case 'row':
              if (row === 0) return 'none'
              break
            case 'column':
              if (column === 0) return 'none'
              break
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                previousEligible = iterateOver === 'row'
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
            rows.pick(previousEligible[0], { ...pickOptions, allowsDuplicates: true })
            columns.pick(previousEligible[1], { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligibleInRow = createToPreviousEligible({ api: api, loops: false, iterateOver: 'column' }),
        toPreviousEligibleInColumn = createToPreviousEligible({ api: api, loops: false, iterateOver: 'row' }),
        all: ReturnType<typeof createEligibleInPlanePickApi>['all'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligiblePickApiOptions, ...options },
                newRows: number[] = [],
                newColumns: number[] = []

          for (let r = 0; r < rows.array.length; r++) {
            for (let c = 0; c < columns.array.length; c++) {
              if (getAbility([r, c]) === 'enabled' && toEligibility([r, c]) === 'eligible') {
                newRows.push(r)
                newColumns.push(c)
              }
            }
          }

          if (newRows.length > 0) {
            rows.pick(newRows, { allowsDuplicates: true })
            columns.pick(newColumns, { allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        }

  // if (isRef(ability)) {
  //   watch(
  //     ability,
  //     () => {
  //       if (ability.value === 'disabled') {
  //         rows.omit()
  //         columns.omit()
  //       }
  //     }
  //   )
  // } else if (typeof ability !== 'string' && typeof ability !== 'function') {
  //   watch(
  //     narrowWatchSources(ability.watchSource),
  //     () => {
  //       const r = new Pickable(rows.array).pick(rows.picks),
  //             c = new Pickable(columns.array).pick(columns.picks)

  //       for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
  //         if (ability.get(r.picks[rowPick], c.picks[rowPick]) === 'disabled') {
  //           r.omit(rowPick, { reference: 'picks' })
  //           c.omit(rowPick, { reference: 'picks' })
  //         }
  //       }

  //       if (r.picks.length !== rows.picks.length) {
  //         rows.pick(r.picks, { replace: 'all' })
  //         columns.pick(c.picks, { replace: 'all' })
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

  //       for (let row = 0; row < rows.array.length; row++) {
  //         for (let column = 0; column < columns.array.length; column++) {
  //           withPositions.push([[row, column], currentElements[row][column]])
  //         }
  //       }

  //       const newRows: number[] = [],
  //             newColumns: number[] = []

  //       for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
  //         const indexInWithPositions = findIndex<typeof withPositions[0]>(
  //           ([_, element]) => element === previousElements[rows.picks[rowPick]][columns.picks[rowPick]]
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
  //         for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
  //           if (
  //             rows.picks[rowPick] < rows.array.length
  //             && columns.picks[rowPick] < columns.array.length
  //           ) {
  //             newRows.push(rows.picks[rowPick])
  //             newColumns.push(columns.picks[rowPick])
  //           }
  //         }

  //         exact(newRows, newColumns, { replace: 'all', allowsDuplicates: true })
  //         return
  //       }
        
  //       if (status.rowLength === 'shortened') {
  //         for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
  //           if (rows.picks[rowPick] < currentElements.length) {
  //             newRows.push(rows.picks[rowPick])
  //             newColumns.push(columns.picks[rowPick])
  //           }
  //         }
          
  //         exact(newRows, newColumns, { replace: 'all', allowsDuplicates: true })
  //         return
  //       }
        
  //       if (status.columnLength === 'shortened') {
  //         for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
  //           if (columns.picks[rowPick] < currentElements[rows.picks[rowPick]].length) {
  //             newRows.push(rows.picks[rowPick])
  //             newColumns.push(columns.picks[rowPick])
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

const toRows = createMap<[row: number, column: number], number>(([row]) => row),
      toColumns = createMap<[row: number, column: number], number>(([, column]) => column)
