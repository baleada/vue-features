import { computed } from 'vue'
import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { ElementApi, SingleIdentifiedElementApi } from './useElementApi'

export function useIdentified (
  { identifying, attribute }: { identifying: ElementApi<HTMLElement, false, false | true>['element'], attribute: string }
): SingleIdentifiedElementApi<HTMLElement> {
  const identified = useElementApi({ identified: true })

  bind(
    identified.element,
    { id: identified.id },
  )

  bind(
    identifying,
    { [attribute]: computed(() => identified.element.value ? identified.id.value : undefined) },
  )
  
  return identified
}
