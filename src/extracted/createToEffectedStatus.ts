import type { WatchSource, WatchCallback } from 'vue'
import { createReduce, createDeepEqual } from '@baleada/logic'
import type { Plane } from './plane'

/**
 * Higher order function that returns a utility for determining the freshness of an array of watch sources.
 * Assumes that the first item in the array of watch sources will be a reactive plane of elements, and intends
 * for the rest to be strings, booleans, or numbers, i.e. values that can be bound to DOM attributes, although
 * it will check for deep equality on any type that might come from userland code.
 */
export function createToEffectedStatus (
  effecteds: Map<Element, [number, number]>
): WatchCallback<readonly [Plane<Element>, ...WatchSource[]]> {
  return (current, previous) => {
    if (current.length > 1) {
      // Skip potentially long element iterations if possible. Any changes
      // to other reactive data should cause side effects.
      for (let i = 1; i < current.length; i++) {
        if (!createDeepEqual(previous[i])(current[i])) return 'stale'
      }
    }

    const elements = current[0]
  
    if (effecteds.size !== toPlaneLength(elements)) return 'stale'

    for (const [effected, [row, column]] of effecteds) {
      // TODO: Test that shows how optional chaining is necessary for the useHead case
      if (elements[row]?.[column] !== effected) return 'stale'
    }

    return 'fresh'
  }
}

const toPlaneLength = createReduce<Element[], number>((length, row) => length + row.length, 0)
