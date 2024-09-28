import { type Coordinates } from './coordinates'

export class Plane<Point extends any> extends Array<Point[]> {
  constructor (...initial: Point[][]) {
    super(...initial)
  }

  get ({ row, column }: Coordinates) {
    return this[row]?.[column]
  }

  set ({ row, column }: Coordinates, value: Point) {
    (this[row] ??= [])[column] = value
  }

  * points () {
    for (let row = 0; row < this.length; row++) {
      for (let column = 0; column < this[0].length; column++) {
        yield {
          row,
          column,
          point: this.get({ row, column }),
        }
      }
    }
  }
}
