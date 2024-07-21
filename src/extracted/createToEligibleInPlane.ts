import { Navigateable } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import type { Coordinates } from './coordinates'

export type ToPlaneEligibility = (coordinates: Coordinates) => Eligibility

type Eligibility = 'eligible' | 'ineligible'

export type ToEligible = ({ coordinates, toEligibility, loops, direction }: {
  coordinates: Coordinates,
  toEligibility: ToPlaneEligibility,
  loops: boolean,
  direction: 'vertical' | 'horizontal',
}) => Coordinates | 'none'

export function createToNextEligible({ api }: { api: PlaneApi<HTMLElement, any> }) {
  return (
    {
      coordinates: { row, column },
      toEligibility,
      loops,
      direction,
    }:
    {
      coordinates: Coordinates,
      toEligibility: ToPlaneEligibility,
      loops: boolean,
      direction: 'vertical' | 'horizontal',
    }
  ): Coordinates | 'none' => {
    if (api.plane.value.length === 0 || api.plane.value[0].length === 0) return 'none'

    const { row: rowLimit, column: columnLimit }: Coordinates = (() => {
            if (!loops) return {
              row: api.plane.value.length - 1,
              column: api.plane.value[0].length - 1,
            }

            switch (direction) {
              case 'vertical':
                return {
                  row: row < 1
                    ? api.plane.value.length - 1
                    : row - 1,
                  column: row < 1 && column < 1
                    ? api.plane.value[0].length - 1
                    : Math.max(column, 0),
                }
              case 'horizontal':
                return {
                  row: row < 1 && column < 1
                    ? api.plane.value.length - 1
                    : Math.max(row, 0),
                  column: column < 1
                    ? api.plane.value[0].length - 1
                    : column - 1,
                }
            }
          })(),
          r = new Navigateable(api.plane.value).navigate(
            direction === 'horizontal' ? Math.max(row, 0) : row,
            { allow: 'any' }
          ),
          c = new Navigateable(api.plane.value[0]).navigate(
            direction === 'vertical' ? Math.max(column, 0) : column,
            { allow: 'any' }
          )

    let nextEligible: Coordinates | 'none' = 'none',
        didReachLimit = r.location === r.array.length - 1 && c.location === c.array.length - 1 && !loops

    switch (direction) {
      case 'vertical':
        while (nextEligible === 'none' && !didReachLimit) {
          let didReachRowLimit = false
          while (nextEligible === 'none' && !didReachRowLimit) {
            r.next({ loops })
            didReachRowLimit = r.location === rowLimit

            const eligibility = toEligibility({ row: r.location, column: c.location })

            if (eligibility === 'eligible') {
              nextEligible = { row: r.location, column: c.location }
              break
            }
          }

          c.next({ loops })
          didReachLimit = didReachRowLimit && c.location === columnLimit
          r.navigate(-1, { allow: 'any' })
        }

        break
      case 'horizontal':
        while (nextEligible === 'none' && !didReachLimit) {
          let didReachColumnLimit = false
          while (nextEligible === 'none' && !didReachColumnLimit) {
            c.next({ loops })
            didReachColumnLimit = c.location === columnLimit

            const eligibility = toEligibility({ row: r.location, column: c.location })

            if (eligibility === 'eligible') {
              nextEligible = { row: r.location, column: c.location }
              break
            }
          }

          r.next({ loops })
          didReachLimit = didReachColumnLimit && r.location === rowLimit
          c.navigate(-1, { allow: 'any' })
        }

        break
    }

    return nextEligible
  }
}

export function createToPreviousEligible ({ api }: { api: PlaneApi<HTMLElement, any> }) {
  return(
    {
      coordinates: { row, column },
      toEligibility,
      loops,
      direction,
    }: {
      coordinates: Coordinates,
      toEligibility: ToPlaneEligibility,
      loops: boolean,
      direction: 'vertical' | 'horizontal',
    }
  ): Coordinates | 'none' => {
    if (api.plane.value.length === 0 || api.plane.value[0].length === 0) return 'none'

    const [rowLimit, columnLimit] = (() => {
            if (!loops) return [0, 0]

            switch (direction) {
              case 'vertical':
                return [
                  row > api.plane.value.length - 2
                    ? 0
                    : row + 1,
                  row > api.plane.value.length - 2 && column > api.plane.value[0].length - 2
                    ? 0
                    : Math.min(column, api.plane.value[0].length - 1),
                ]
              case 'horizontal':
                return [
                  row > api.plane.value.length - 2 && column > api.plane.value[0].length - 2
                    ? 0
                    : Math.min(row, api.plane.value.length - 1),
                  column > api.plane.value[0].length - 2
                    ? 0
                    : column + 1,
                ]
            }
          })(),
          r = new Navigateable(api.plane.value).navigate(
            direction === 'horizontal' ? Math.min(row, api.plane.value.length - 1) : row,
            { allow: 'any' }
          ),
          c = new Navigateable(api.plane.value[0]).navigate(
            direction === 'vertical' ? Math.min(column, api.plane.value[0].length - 1) : column,
            { allow: 'any' }
          )

    let previousEligible: Coordinates | 'none' = 'none',
        didReachLimit = r.location === 0 && c.location === 0 && !loops

    switch (direction) {
      case 'vertical':
        while (previousEligible === 'none' && !didReachLimit) {
          let didReachRowLimit = false
          while (previousEligible === 'none' && !didReachRowLimit) {
            r.previous({ loops })
            didReachRowLimit = r.location === rowLimit

            const eligibility = toEligibility({ row: r.location, column: c.location })

            if (eligibility === 'eligible') {
              previousEligible = { row: r.location, column: c.location }
              break
            }
          }

          c.previous({ loops })
          didReachLimit = didReachRowLimit && c.location === columnLimit
          r.navigate(api.plane.value.length, { allow: 'any' })
        }

        break
      case 'horizontal':
        while (previousEligible === 'none' && !didReachLimit) {
          let didReachColumnLimit = false
          while (previousEligible === 'none' && !didReachColumnLimit) {
            c.previous({ loops })
            didReachColumnLimit = c.location === columnLimit

            const eligibility = toEligibility({ row: r.location, column: c.location })

            if (eligibility === 'eligible') {
              previousEligible = { row: r.location, column: c.location }
              break
            }
          }

          r.previous({ loops })
          didReachLimit = didReachColumnLimit && r.location === rowLimit
          c.navigate(api.plane.value[0].length, { allow: 'any' })
        }

        break
    }

    return previousEligible
  }
}
