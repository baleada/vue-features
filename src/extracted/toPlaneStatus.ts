import type { Plane } from './plane'
import { toPlaneOrder } from './toPlaneOrder'
import type { ToPlaneOrderOptions } from './toPlaneOrder'

export type ToPlaneStatusOptions<T extends any> = ToPlaneOrderOptions<T>

export function toPlaneStatus<T extends any> (
  currentPlane: Plane<T>,
  previousPlane: Plane<T>,
  options: ToPlaneStatusOptions<T> = {},
) {
  if (currentPlane && !previousPlane) return {
    rowLength: 'lengthened',
    columnLength: 'lengthened',
    order: 'changed',
  } as const

  const rowLength = (() => {
          if (currentPlane.length === 0) return 'n/a'
          if (currentPlane[0].length > previousPlane[0].length) return 'lengthened'
          if (currentPlane[0].length < previousPlane[0].length) return 'shortened'
          return 'none'
        })(),
        columnLength = (() => {
          if (currentPlane.length > previousPlane.length) return 'lengthened'
          if (currentPlane.length < previousPlane.length) return 'shortened'
          return 'none'
        })(),
        order = toPlaneOrder(
          currentPlane,
          previousPlane,
          options,
        )

  return { rowLength, columnLength, order } as const
}
