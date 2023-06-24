import { createReduce } from '@baleada/logic'
import type { schedule } from './schedule'

/**
 * Higher order function that returns a utility for determining the freshness of an array of watch sources.
    Assumes that the first item in the array of watch sources will be a plane of elements, and the rest
    will be strings, booleans, or numbers, i.e. values that can be bound to DOM attributes.
 */
export function createToEffectedStatus (
  effecteds: Map<Element, [number, number]>
): Parameters<typeof schedule>[0]['toEffectedStatus'] {
  return (current, previous) => {
    if (current.length > 1) {
      // Skip more expensive element checks if possible. Any changes
      // to other reactive data should cause side effects.
      for (let i = 1; i < current.length; i++) {
        if (current[i] !== previous[i]) {
          return 'stale'
        }
      }
    }

    const elements = current[0]
  
    if (effecteds.size !== toPlaneLength(elements)) {
      return 'stale'
    }

    for (const [effected, [rowIndex, columnIndex]] of effecteds) {
      // TODO: Test that shows how optional chaining is necessary for the useHead case
      if (elements[rowIndex]?.[columnIndex] !== effected) {
        return 'stale'
      }
    }

    return 'fresh'
  }
}

const toPlaneLength = createReduce<Element[], number>((length, row) => length + row.length, 0)
