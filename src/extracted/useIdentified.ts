import { computed } from 'vue'
import { bind } from '../affordances/bind'
import { useSingleElement } from './elementApi'
import type { SingleElement } from './elementApi'
import { useSingleId } from './idApi'
import { preventEffect } from './scheduleBind'

export function useIdentified ({ identifying, attribute }: { identifying: SingleElement<HTMLElement>['element'], attribute: string }): { root: SingleElement<HTMLElement> } {
  const identified = useSingleElement(),
        identifiedId = useSingleId(identified.element)

  bind({
    element: identified.element,
    values: { id: identifiedId },
  })

  bind({
    element: identifying,
    values: { [attribute]: computed(() => identified.element.value ? identifiedId.value : preventEffect()) },
  })
  
  return { root: identified }
}
