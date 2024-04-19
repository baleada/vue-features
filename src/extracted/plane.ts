import type { Coordinates } from './coordinates'

export class Plane<T extends any> extends Array<T[]> {
  constructor (...initial: T[][]) { // TODO: params
    super(...initial)
  }

  get ([row, column]: Coordinates) {
    return this[row]?.[column]
  }

  set ([row, column]: Coordinates, value: T) {
    (this[row] ??= [])[column] = value
  }
}
