import { computed } from 'vue'
import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { Api, ElementApi } from './useElementApi'

export function useIdentified (
  { identifying, attribute }: { identifying: Api<HTMLElement, 'element', false | true>['element'], attribute: string }
): ElementApi<HTMLElement> {
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
