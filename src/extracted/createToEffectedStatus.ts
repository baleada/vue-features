import type { Ref } from 'vue'
import { schedule} from './schedule'

export function createToEffectedStatus (effecteds: Ref<Map<Element,  number>>): Parameters<typeof schedule>[0]['toEffectedStatus'] {
  return (current, previous) => {
    if (current.length > 1) {
      return 'stale'
    }

    const elements = current[0]
  
    if (effecteds.value.size !== elements.length) {
      return 'stale'
    }

    for (const [effected, index] of effecteds.value) {
      if (!elements[index].isSameNode(effected)) {
        return 'stale'
      }
    }

    return 'fresh'
  }
}
