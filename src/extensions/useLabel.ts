import { computed } from 'vue'
import { bind } from '../affordances/bind'
import type { SingleElement } from '../extracted/useElements'
import {
  useSingleId,
  preventEffect,
  useIdentified
} from '../extracted'

export function useLabel (labelled: SingleElement<HTMLElement>['element'], { bindsHtmlFor }: { bindsHtmlFor?: boolean } = {}): SingleElement<HTMLElement> {
  const label = useIdentified({
    identifying: labelled,
    attribute: 'ariaLabelledby',
  })
  
  if (bindsHtmlFor) {
    const labelledId = useSingleId(labelled)

    bind({
      element: labelled,
      values: {
        id: labelledId,
      }
    })
  
    bind({
      element: label.element,
      values: {
        htmlFor: labelledId,
      },
    })
  }

  return label
}
