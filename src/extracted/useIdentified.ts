import { computed } from 'vue'
import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { ElementApi } from './useElementApi'
import { preventEffect } from './scheduleBind'

export function useIdentified (
  { identifying, attribute }: { identifying: ElementApi<HTMLElement, 'single', false>['element'], attribute: string }
): {
  root: ElementApi<HTMLElement, 'single', true>,
} {
  const identified = useElementApi({ type: 'single', identified: true })

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
