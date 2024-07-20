import type { Plane } from './plane'

export type ToPlaneOrderOptions<T extends any> = {
  predicateEqual?: (currentPoint: T, previousPoint: T) => boolean
}

const defaultOptions: Required<ToPlaneOrderOptions<any>> = {
  predicateEqual: (currentPoint, previousPoint) => currentPoint === previousPoint,
}

export function toPlaneOrder<T extends any> (
  currentPoints: Plane<T>,
  previousPoints: Plane<T>,
  options: ToPlaneOrderOptions<T> = {},
) {
  const { predicateEqual } = { ...defaultOptions, ...options }

  for (const { row, column, point: currentPoint } of currentPoints.points()) {
    const previousPoint = previousPoints.get([row, column])
    if (isNullish(currentPoint) || isNullish(previousPoint)) continue
    if (!predicateEqual(currentPoint, previousPoint)) return 'changed'
  }

  return 'none'
}

function isNullish (value: unknown): value is undefined | null {
  return value === undefined || value === null
}
