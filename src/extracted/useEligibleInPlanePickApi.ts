import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { createFilter, createMap, Pickable } from '@baleada/logic'
import type { PickOptions } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInPlane'
import type { ToPlaneEligibility } from './createToEligibleInPlane'
import type { Ability } from './ability'
import type { Coordinates } from './coordinates'

export type EligibleInPlanePickApi = {
  exact: (coordinatesOrCoordinateList: Coordinates | Coordinates[], options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  next: (coordinates: Coordinates, options?: EligibleInPlanePickNextPreviousOptions) => 'enabled' | 'none',
  nextInRow: (coordinates: Coordinates, options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  nextInColumn: (coordinates: Coordinates, options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  previous: (coordinates: Coordinates, options?: EligibleInPlanePickNextPreviousOptions) => 'enabled' | 'none',
  previousInRow: (coordinates: Coordinates, options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  previousInColumn: (coordinates: Coordinates, options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
  all: (options?: BaseEligibleInPlanePickApiOptions) => 'enabled' | 'none',
}

export type BaseEligibleInPlanePickApiOptions = (
  & Omit<PickOptions, 'allowsDuplicates'>
  & { toEligibility?: ToPlaneEligibility }
)

type EligibleInPlanePickNextPreviousOptions = (
  & BaseEligibleInPlanePickApiOptions
  & { direction?: 'vertical' | 'horizontal' }
)

const defaultEligibleInPlanePickApiOptions: BaseEligibleInPlanePickApiOptions = {
  toEligibility: () => 'eligible',
}

const defaultEligibleInPlanePickNextPreviousOptions: EligibleInPlanePickNextPreviousOptions = {
  ...defaultEligibleInPlanePickApiOptions,
  direction: 'horizontal',
}

export function useEligibleInPlanePickApi<
  Meta extends {
    ability?: Ability,
    kind?: 'item' | 'checkbox' | 'radio',
    group?: string,
  }
> (
  { rows, columns, api }: {
    rows: ShallowReactive<Pickable<HTMLElement[]>>,
    columns: ShallowReactive<Pickable<HTMLElement>>,
    api: PlaneApi<HTMLElement, any, Meta>,
  }
): EligibleInPlanePickApi {
  const exact: EligibleInPlanePickApi['exact'] = (coordinatesOrCoordinatesList, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligibleInPlanePickApiOptions, ...options },
                coordinatesList = Array.isArray(coordinatesOrCoordinatesList)
                  ? coordinatesOrCoordinatesList
                  : [coordinatesOrCoordinatesList],
                newRowPicks = toRows(coordinatesList),
                newColumnPicks = toColumns(coordinatesList),
                r = new Pickable(rows.array).pick(newRowPicks, { allowsDuplicates: true }),
                c = new Pickable(columns.array).pick(newColumnPicks, { allowsDuplicates: true }),
                eligibleRows = createFilter<number>((row, index) =>
                  getEligibility({ row, column: c.picks[index] }) === 'eligible'
                  && toEligibility({ row, column: c.picks[index] }) === 'eligible'
                )(r.picks),
                eligibleColumns = createFilter<number>((column, index) =>
                  getEligibility({ row: r.picks[index], column }) === 'eligible'
                  && toEligibility({ row: r.picks[index], column }) === 'eligible'
                )(c.picks)

          if (eligibleRows.length > 0) {
            const r = new Pickable(rows.array)
                    .pick(rows.picks)
                    .pick(eligibleRows, { ...pickOptions, allowsDuplicates: true }),
                  c = new Pickable(columns.array)
                    .pick(columns.picks)
                    .pick(eligibleColumns, { ...pickOptions, allowsDuplicates: true }),
                  omitIndices = toGroupOmitIndices({ rowPicks: r.picks, columnPicks: c.picks })

            r.omit(omitIndices, { reference: 'picks' })
            c.omit(omitIndices, { reference: 'picks' })
            rows.pick(r.picks, { ...pickOptions, replace: 'all', allowsDuplicates: true })
            columns.pick(c.picks, { ...pickOptions, replace: 'all', allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toGroupOmitIndices = ({ rowPicks, columnPicks }: { rowPicks: number[], columnPicks: number[] }) => {
          const picksByGroup: Record<string, Coordinates> = {},
                omitIndices: number[] = []

          for (let i = rowPicks.length - 1; i >= 0; i--) {
            const pick: Coordinates = { row: rowPicks[i], column: columnPicks[i] },
                  group = toGroup(pick),
                  kind = toKind(pick)

            if (!group || kind !== 'radio') continue

            if (!picksByGroup[group]) {
              picksByGroup[group] = pick
              continue
            }

            omitIndices.push(i)
          }

          return omitIndices
        },
        next: EligibleInPlanePickApi['next'] = (coordinates, options = {}) => {
          const { direction, toEligibility, ...pickOptions } = { ...defaultEligibleInPlanePickNextPreviousOptions, ...options }

          const nextEligible = toNextEligible({
            coordinates,
            loops: false,
            direction,
            toEligibility: coordinates => getEligibility(coordinates) === 'eligible'
              ? toEligibility(coordinates)
              : 'ineligible',
          })

          if (nextEligible !== 'none') {
            const { row: newRow, column: newColumn } = nextEligible
            rows.pick(newRow, { ...pickOptions, allowsDuplicates: true })
            columns.pick(newColumn, { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ api: api }),
        nextInRow: EligibleInPlanePickApi['nextInRow'] = ({ row, column }, options = { toEligibility: () => 'eligible' }) => {
          return next(
            { row, column },
            {
              direction: 'horizontal',
              toEligibility: ({ row: r, column: c }) => r === row && options.toEligibility({ row: r, column: c }) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        nextInColumn: EligibleInPlanePickApi['nextInRow'] = ({ row, column }, options = { toEligibility: () => 'eligible' }) => {
          return next(
            { row, column },
            {
              direction: 'vertical',
              toEligibility: ({ row: r, column: c }) => c === column && options.toEligibility({ row: r, column: c }) === 'eligible'
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
            toEligibility: coordinates => getEligibility(coordinates) === 'eligible'
              ? toEligibility(coordinates)
              : 'ineligible',
          })

          if (previousEligible !== 'none') {
            const { row: newRow, column: newColumn } = previousEligible
            rows.pick(newRow, { ...pickOptions, allowsDuplicates: true })
            columns.pick(newColumn, { ...pickOptions, allowsDuplicates: true })
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ api }),
        previousInRow: EligibleInPlanePickApi['previousInRow'] = ({ row, column }, options = { toEligibility: () => 'eligible' }) => {
          return previous(
            { row, column },
            {
              direction: 'horizontal',
              toEligibility: ({ row: r, column: c }) => r === row && options.toEligibility({ row: r, column: c }) === 'eligible'
                ? 'eligible'
                : 'ineligible',
            }
          )
        },
        previousInColumn: EligibleInPlanePickApi['previousInRow'] = ({ row, column }, options = { toEligibility: () => 'eligible' }) => {
          return previous(
            { row, column },
            {
              direction: 'vertical',
              toEligibility: ({ row: r, column: c }) => c === column && options.toEligibility({ row: r, column: c }) === 'eligible'
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
              if (getEligibility({ row: r, column: c }) === 'eligible' && toEligibility({ row: r, column: c }) === 'eligible') {
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
        getEligibility = (coordinates: Coordinates) => (
          (
            toAbility(coordinates) === 'enabled'
            && toKind(coordinates) !== 'item'
          ) ? 'eligible' : 'ineligible'
        ),
        toAbility = (coordinates: Coordinates) => api.meta.value.get(coordinates)?.ability || 'enabled',
        toKind = (coordinates: Coordinates) => api.meta.value.get(coordinates)?.kind,
        toGroup = (coordinates: Coordinates) => api.meta.value.get(coordinates)?.group

  watch(
    api.meta,
    () => {
      const r = new Pickable(rows.array).pick(rows.picks),
            c = new Pickable(columns.array).pick(columns.picks)

      for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
        if (getEligibility({ row: r.picks[rowPick], column: c.picks[rowPick] }) === 'ineligible') {
          r.omit(rowPick, { reference: 'picks' })
          c.omit(rowPick, { reference: 'picks' })
        }
      }

      if (r.picks.length !== rows.picks.length) {
        rows.pick(r.picks, { replace: 'all' })
        columns.pick(c.picks, { replace: 'all' })
      }
    },
    { flush: 'post' }
  )

  watch(
    api.meta,
    () => {
      const omitIndices = toGroupOmitIndices({ rowPicks: rows.picks, columnPicks: columns.picks })

      rows.omit(omitIndices, { reference: 'picks' })
      columns.omit(omitIndices, { reference: 'picks' })
    },
    { flush: 'post' }
  )


  // watch(
  //   [plane.status, plane.elements, plane.meta],
  //   (currentSources, previousSources) => {
  //     const { 0: status, 1: currentElements } = currentSources,
  //           { 1: previousElements } = previousSources

  //     if (!currentElements.length) return // Conditionally removed

  //     if (status.order === 'changed') {
  //       const withPositions: [position: Coordinates, element: HTMLElement][] = []

  //       for (let row = 0; row < rows.array.length; row++) {
  //         for (let column = 0; column < columns.array.length; column++) {
  //           withPositions.push([{ row, column }, currentElements[row][column]])
  //         }
  //       }

  //       const newRows: number[] = [],
  //             newColumns: number[] = []

  //       for (let rowPick = 0; rowPick < rows.picks.length; rowPick++) {
  //         const indexInWithPositions = findIndex<typeof withPositions[0]>(
  //           ([_, element]) => element === previousElements[rows.picks[rowPick]][columns.picks[rowPick]]
  //         )(withPositions) as number

  //         if (typeof indexInWithPositions === 'number') {
  //           const { row, column } = withPositions[indexInWithPositions][0]
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

const toRows = createMap<Coordinates, number>(({ row }) => row),
      toColumns = createMap<Coordinates, number>(({ column }) => column)
