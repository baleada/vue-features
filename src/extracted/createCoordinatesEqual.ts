import type { Coordinates } from './coordinates'

export function createCoordinatesEqual (coordinates: Coordinates) {
  return (candidate: Coordinates) => (
    candidate[0] === coordinates[0]
    && candidate[1] === coordinates[1]
  )
}
