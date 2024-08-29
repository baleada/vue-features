import { find, findIndex } from 'lazy-collections'
import type { PlaneApi } from './usePlaneApi'
import type { Coordinates } from './coordinates'
import type { SupportedElement } from './toRenderedKind'

export function createCoordinates (planeApi: PlaneApi<SupportedElement>): (element: SupportedElement) => Coordinates {
  return element => {
    const row = findIndex<SupportedElement[]>(row =>
            !!(find<SupportedElement>(el => el === element)(row) as SupportedElement)
          )(planeApi.plane.value) as number,
          column = findIndex<SupportedElement>(el => el === element)(planeApi.plane.value[row] || []) as number

    return { row, column }
  }
}
