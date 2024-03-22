import type { ShallowReactive } from 'vue'
import { createFilter, createMap, Pickable } from '@baleada/logic'
import type { PickOptions } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import type { Ability } from './ability'

export type EligibleInPlanePickApi = {
  exact: (coordinatesOrCoordinateList: [row: number, column: number] | [row: number, column: number][], options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  next: (coordinates: [row: number, column: number], options?: EligibleInPlanePickNextPreviousOptions) => 'enabled' | 'none',
  nextInRow: (coordinates: [row: number, column: number], options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  nextInColumn: (coordinates: [row: number, column: number], options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  previous: (coordinates: [row: number, column: number], options?: EligibleInPlanePickNextPreviousOptions) => 'enabled' | 'none',
  previousInRow: (coordinates: [row: number, column: number], options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  previousInColumn: (coordinates: [row: number, column: number], options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  all: (options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
}

type BaseEligibleInPlanePickApiOptions = PickOptions & { toEligibility?: ToPlaneEligibility }

type EligibleInPlanePickNextPreviousOptions = BaseEligibleInPlanePickApiOptions & { direction?: 'vertical' | 'horizontal' }

const defaultEligibleInPlanePickApiOptions: BaseEligibleInPlanePickApiOptions = {
  toEligibility: () => 'eligible',
}

const defaultEligibleInPlanePickNextPreviousOptions: EligibleInPlanePickNextPreviousOptions = {
  ...defaultEligibleInPlanePickApiOptions,
  direction: 'horizontal',
}

/**
 * Creates methods for picking only the elements in a plane that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInPlanePickApi<Meta extends { ability?: Ability }> (
  { rows, columns, api }: {
    rows: ShallowReactive<Pickable<HTMLElement[]>>,
    columns: ShallowReactive<Pickable<HTMLElement>>,
    api: PlaneApi<HTMLElement, true, Meta>,
  }
): EligibleInPlanePickApi {
  const exact: EligibleInPlanePickApi['exact'] = (coordinatesOrCoordinatesList, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligibleInPlanePickApiOptions, ...options },
                coordinatesList = Array.isArray(coordinatesOrCoordinatesList[0])
                  ? coordinatesOrCoordinatesList as [row: number, column: number][]
                  : [coordinatesOrCoordinatesList] as [row: number, column: number][],
                newRowPicks = toRows(coordinatesList),
                newColumnPicks = toColumns(coordinatesList),
                r = new Pickable(rows.array).pick(newRowPicks),
                c = new Pickable(columns.array).pick(newColumnPicks),
                eligibleRows = createFilter<number>((row, index) =>
                  toAbility([row, c.picks[index]]) === 'enabled'
                  && toEligibility([row, c.picks[index]]) === 'eligible'
                )(r.picks),
                eligibleColumns = createFilter<number>((column, index) =>
                  toAbility([r.picks[index], column]) === 'enabled'
                  && toEligibility([r.picks[index], column]) === 'eligible'
                )(c.picks)

          if (eligibleRows.length > 0) {
            rows.pick(eligibleRows, { ...pickOptions, allowsDuplicates: true })
            columns.pick(eligibleColumns, { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        next: EligibleInPlanePickApi['next'] = (coordinates, options = {}) => {
          const { direction, toEligibility, ...pickOptions } = { ...defaultEligibleInPlanePickNextPreviousOptions, ...options }

          const nextEligible = toNextEligible({
            coordinates,
            loops: false,
            direction,
            toEligibility: index => toAbility(index) === 'enabled'
              ? toEligibility(index)
              : 'ineligible',
          })
            
          if (Array.isArray(nextEligible)) {
            const [newRow, newColumn] = nextEligible
            rows.pick(newRow, { ...pickOptions, allowsDuplicates: true })
            columns.pick(newColumn, { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api: api }),
        nextInRow: EligibleInPlanePickApi['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
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
        nextInColumn: EligibleInPlanePickApi['nextInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
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
        previous: EligibleInPlanePickApi['previous'] = (coordinates, options = {}) => {
          const { direction, toEligibility, ...pickOptions } = { ...defaultEligibleInPlanePickNextPreviousOptions, ...options }

          const previousEligible = toPreviousEligible({
            coordinates,
            loops: false,
            direction,
            toEligibility: index => toAbility(index) === 'enabled'
              ? toEligibility(index)
              : 'ineligible',
          })
            
          if (Array.isArray(previousEligible)) {
            const [newRow, newColumn] = previousEligible
            rows.pick(newRow, { ...pickOptions, allowsDuplicates: true })
            columns.pick(newColumn, { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api }),
        previousInRow: EligibleInPlanePickApi['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
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
        previousInColumn: EligibleInPlanePickApi['previousInRow'] = ([row, column], options = { toEligibility: () => 'eligible' }) => {
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
        all: EligibleInPlanePickApi['all'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligibleInPlanePickApiOptions, ...options },
                newRows: number[] = [],
                newColumns: number[] = []

          for (let r = 0; r < rows.array.length; r++) {
            for (let c = 0; c < columns.array.length; c++) {
              if (toAbility([r, c]) === 'enabled' && toEligibility([r, c]) === 'eligible') {
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
        },
        toAbility = ([row, column]: [row: number, column: number]) => api.meta.value[row][column].ability || 'enabled'

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
    next,
    nextInRow,
    nextInColumn,
    previous,
    previousInRow,
    previousInColumn,
    all,
  }
}

const toRows = createMap<[row: number, column: number], number>(([row]) => row),
      toColumns = createMap<[row: number, column: number], number>(([, column]) => column)
