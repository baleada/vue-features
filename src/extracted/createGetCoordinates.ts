import { find, findIndex } from 'lazy-collections'
import type { PlaneApi } from './usePlaneApi'
import type { Coordinates } from './coordinates'

export function createGetCoordinates (planeApi: PlaneApi<HTMLElement>): (element: HTMLElement) => Coordinates {
  return element => {
    const row = findIndex<HTMLElement[]>(row =>
            !!(find<HTMLElement>(el => el === element)(row) as HTMLElement)
          )(planeApi.plane.value) as number,
          column = findIndex<HTMLElement>(el => el === element)(planeApi.plane.value[row] || []) as number

    return { row, column }
  }
}
