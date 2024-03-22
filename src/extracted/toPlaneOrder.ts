import type { Plane } from './plane'

export type ToPlaneOrderOptions<T extends any> = {
  predicateEqual?: (itemA: T, itemB: T) => boolean
}

const defaultOptions: Required<ToPlaneOrderOptions<any>> = {
  predicateEqual: (itemA, itemB) => itemA === itemB,
}

export function toPlaneOrder<T extends any> (
  itemsA: Plane<T>,
  itemsB: Plane<T>,
  options: ToPlaneOrderOptions<T> = {},
) {
  const { predicateEqual } = { ...defaultOptions, ...options }

  for (let row = 0; row < itemsA.length; row++) {
    for (let column = 0; column < itemsA[0].length; column++) {
      if (isNullish(itemsA[row]?.[column]) || isNullish(itemsB[row]?.[column])) continue
      if (!predicateEqual(itemsA[row][column], itemsB[row][column])) return 'changed'
    }
  }

  return 'none'
}

function isNullish (value: unknown): value is undefined | null {
  return value === undefined || value === null
}
