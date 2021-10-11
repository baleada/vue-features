import { computed } from 'vue'
import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { ElementApi, SingleIdentifiedElementApi } from './useElementApi'
import { preventEffect } from './scheduleBind'

export function useIdentified (
  { identifying, attribute }: { identifying: ElementApi<HTMLElement, false, false | true>['element'], attribute: string }
): {
  root: SingleIdentifiedElementApi<HTMLElement>,
} {
  const identified = useElementApi({ identified: true })

  bind({
    element: identified.element,
    values: { id: identified.id },
  })

  bind({
    element: identifying,
    values: { [attribute]: computed(() => identified.element.value ? identified.id.value : preventEffect()) },
  })
  
  return { root: identified }
}
