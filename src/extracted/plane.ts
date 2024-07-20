import type { Coordinates } from './coordinates'

export class Plane<T extends any> extends Array<T[]> {
  constructor (...initial: T[][]) {
    super(...initial)
  }

  get ([row, column]: Coordinates) {
    return this[row]?.[column]
  }

  set ([row, column]: Coordinates, value: T) {
    (this[row] ??= [])[column] = value
  }

  * points () {
    for (let row = 0; row < this.length; row++) {
      for (let column = 0; column < this[0].length; column++) {
        yield {
          row,
          column,
          point: this.get([row, column]),
        }
      }
    }
  }
}
