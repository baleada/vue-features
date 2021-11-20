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

  bind({
    element: identifieds.elements,
    values: {
      id: ({ index }) => identifieds.ids.value[index],
    },
  })

  bind({
    element: identifying,
    values: {
      [attribute]: {
        get: ({ index }) => identifieds.elements.value[index] ? identifieds.ids.value[index] : undefined,
        watchSources: identifieds.elements,
      }
    },
  })
  
  return identifieds
}
