import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'

export function useLabel (labelled: SingleElement<HTMLElement>['element'], { text }: { text?: string } = {}): SingleElement<HTMLElement> {
  const root = useSingleElement(),
        rootId = text ? undefined : useSingleId({ element: root.element })

  if (!text) {
    // TODO: No text and no label element is an accessibility issue. Maybe warn here.
    bind({
      element: root.element,
      values: { id: rootId },
    })
  }

  bind({
    element: labelled,
    values: {
      [text ? 'ariaLabel' : 'ariaLabelledby']: text || rootId,
    }
  })

  return root
}
