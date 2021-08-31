import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'

export function useDescription (described: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  const root = useSingleElement(),
        rootId = useSingleId({ element: root.element })

  bind({
    element: root.element,
    values: { id: rootId },
  })

  bind({
    element: described,
    values: { ariaDescribedby: rootId }
  })
  
  return root
}
