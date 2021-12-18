import type { Ref } from 'vue'
import { schedule} from './schedule'

/**
 * Higher order function that returns a utility for determining the freshness of an array of watch sources. 
    Assumes that the first item in the array of watch sources will be an array of elements, and the rest 
    will be strings, booleans, or numbers, i.e. values that can be bound to DOM attributes.
 */
export function createToEffectedStatus (effecteds: Ref<Map<Element,  number>>): Parameters<typeof schedule>[0]['toEffectedStatus'] {
  return (current, previous) => {
    if (current.length > 1) {
      for (let i = 1; i < current.length; i++) {
        if (current[i] !== previous[i]) {
          return 'stale'
        }
      }
    }

    const elements = current[0]
  
    if (effecteds.value.size !== elements.length) {
      return 'stale'
    }

    for (const [effected, index] of effecteds.value) {
      // TODO: Test that shows how optional chaining is necessary for the useHead case
      if (!elements[index]?.isSameNode(effected)) {
        return 'stale'
      }
    }

    return 'fresh'
  }
}
