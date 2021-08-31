import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'

export function useLabel (labelled: SingleElement<HTMLElement>['element'], { text, htmlFor }: { text?: string, htmlFor?: ReturnType<typeof useSingleId> } = {}): SingleElement<HTMLElement> {
  const label = useSingleElement(),
        labelId = text ? undefined : useSingleId({ element: label.element })

  if (!text) {
    // TODO: No text and no label element is an accessibility issue. Maybe warn here.
    bind({
      element: label.element,
      values: {
        id: labelId,
        htmlFor,
      },
    })
  }

  bind({
    element: labelled,
    values: {
      [text ? 'ariaLabel' : 'ariaLabelledby']: text || labelId,
    }
  })

  return label
}
