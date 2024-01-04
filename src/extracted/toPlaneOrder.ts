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
    for (let column = 0; column < itemsA.length; column++) {
      if (!itemsA[row]?.[column] || !itemsB[row]?.[column]) continue
      if (!predicateEqual(itemsA[row][column], itemsB[row][column])) return 'changed'
    }
  }

  return 'none'
}
