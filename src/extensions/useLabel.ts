import { bind } from '../affordances/bind'
import type { SingleElement, Extendable } from '../extracted'
import {
  useSingleId,
  useIdentified,
  ensureElementFromExtendable,
} from '../extracted'

export type Label = {
  root: SingleElement<HTMLElement>
}

export function useLabel (extendable: Extendable, { bindsHtmlFor }: { bindsHtmlFor?: boolean } = {}): Label {
  const element = ensureElementFromExtendable(extendable)

  const label = useIdentified({
    identifying: element,
    attribute: 'ariaLabelledby',
  })
  
  if (bindsHtmlFor) {
    const labelledId = useSingleId(element)

    bind({
      element: element,
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

  return {
    root: label
  }
}
