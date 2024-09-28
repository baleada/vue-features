import { type Coordinates } from './coordinates'

export function createCoordinatesEqual (coordinates: Coordinates) {
  return (candidate: Coordinates) => (
    candidate.row === coordinates.row
    && candidate.column === coordinates.column
  )
}
