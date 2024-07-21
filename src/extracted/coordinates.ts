export type Coordinates = { row: number, column: number }

export function predicateCoordinates (param: unknown): param is Coordinates {
  return typeof param === 'object' &&
         typeof (param as Record<any, any>).row === 'number' &&
         typeof (param as Record<any, any>).column === 'number'
}
