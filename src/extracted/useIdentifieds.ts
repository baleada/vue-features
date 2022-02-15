import { computed } from 'vue'
import { join } from 'lazy-collections'
import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { ElementApi, MultipleIdentifiedElementsApi } from './useElementApi'

const toJoined = join('')

export function useIdentifieds (
  { identifying, attribute }: { identifying: ElementApi<HTMLElement, true, false | true>['elements'], attribute: string }
): MultipleIdentifiedElementsApi<HTMLElement> {
  const identifieds = useElementApi({ multiple: true, identified: true })

  bind(
    identifieds.elements,
    { id: index => identifieds.ids.value[index] },
  )

  bind(
    identifying,
    {
      [attribute]: {
        get: index => identifieds.elements.value[index] ? identifieds.ids.value[index] : undefined,
        watchSource: identifieds.elements,
      }
    },
  )
  
  return identifieds
}
