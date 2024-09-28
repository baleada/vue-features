import { type Plane } from './plane'
import {
  toPlaneOrder,
  type ToPlaneOrderOptions,
} from './toPlaneOrder'

export type ToPlaneStatusOptions<T extends any> = ToPlaneOrderOptions<T>

export function toPlaneStatus<T extends any> (
  currentPlane: Plane<T>,
  previousPlane: Plane<T>,
  options: ToPlaneStatusOptions<T> = {},
) {
  if (currentPlane && !previousPlane) return {
    rowWidth: 'lengthened',
    columnHeight: 'lengthened',
    order: 'changed',
  } as const

  const rowWidth = (() => {
          if (!currentPlane.length) return 'n/a'
          if (currentPlane[0].length > (previousPlane[0]?.length || 0)) return 'lengthened'
          if (currentPlane[0].length < (previousPlane[0]?.length || 0)) return 'shortened'
          return 'none'
        })(),
        columnHeight = (() => {
          if (!currentPlane[0]?.length) return 'n/a'
          if (currentPlane.length > previousPlane.length) return 'lengthened'
          if (currentPlane.length < previousPlane.length) return 'shortened'
          return 'none'
        })(),
        order = toPlaneOrder(
          currentPlane,
          previousPlane,
          options,
        )

  return { rowWidth, columnHeight, order } as const
}
