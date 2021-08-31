import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'

export function useErrorMessage (invalid: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  const root = useSingleElement(),
        rootId = useSingleId({ element: root.element })

  bind({
    element: root.element,
    values: { id: rootId },
  })

  bind({
    element: invalid,
    values: { ariaErrormessage: rootId }
  })

  return root
}
