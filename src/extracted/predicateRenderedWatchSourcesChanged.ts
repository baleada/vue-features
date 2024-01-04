import type { WatchSource } from 'vue'
import { createDeepEqual } from '@baleada/logic'
import type { Plane } from './plane'
import { toPlaneStatus } from './toPlaneStatus'
import type { SupportedRendered } from './toRenderedKind'

/**
 * Higher order function that returns a utility for determining whether an array of watch sources has changed.
 * 
 * Assumes that the first item in the array of watch sources will be a reactive plane of items collected by
 * a function ref during Vue's render phase, and assumes all other items in the watch source array can be
 * any data type, and are not collected by a function ref during Vue's render phase.
 */
export function predicateRenderedWatchSourcesChanged<R extends SupportedRendered> (
  current: [Plane<R>, ...WatchSource[]],
  previous: [Plane<R>, ...WatchSource[]],
) {
  if (current.length > 1) {
    // Skip potentially long element iterations if possible. Any changes
    // to other reactive data should cause side effects.
    for (let i = 1; i < current.length; i++) {
      if (!createDeepEqual(previous?.[i])(current[i])) return true
    }
  }

  const currentPlane = current[0],
        previousPlane = previous?.[0],
        { rowLength, columnLength, order } = toPlaneStatus(currentPlane, previousPlane)

  return ![rowLength, columnLength, order].every(status => status === 'none')
}
