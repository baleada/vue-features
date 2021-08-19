import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'

export function useDescription ({ described }: { described: SingleElement<HTMLElement>['element'] }): SingleElement<HTMLElement> {
  const description = useSingleElement(),
        descriptionId = useSingleId({ element: description.element })

  bind({
    element: description.element,
    values: { id: descriptionId },
  })

  bind({
    element: described,
    values: { ariaDescribedby: descriptionId }
  })
  
  return description
}
