import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'
import { preventEffect } from './scheduleBind'
import { computed } from '@vue/runtime-dom'

export function useIdentified ({ identifying, attribute }: { identifying: SingleElement<HTMLElement>['element'], attribute: string }): SingleElement<HTMLElement> {
  const identified = useSingleElement(),
        identifiedId = useSingleId({ element: identified.element })

  bind({
    element: identified.element,
    values: { id: identifiedId },
  })

  bind({
    element: identifying,
    values: { [attribute]: computed(() => identified.element.value ? identifiedId.value : preventEffect()) },
  })
  
  return identified
}
