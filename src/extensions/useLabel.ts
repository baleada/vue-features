import { bind } from '../affordances/bind'
import type { Extendable } from '../extracted'
import {
  useSingleId,
  useIdentified,
  ensureElementFromExtendable,
} from '../extracted'

export type Label = ReturnType<typeof useIdentified>

export function useLabel (extendable: Extendable, { bindsHtmlFor }: { bindsHtmlFor?: boolean } = {}): Label {
  const element = ensureElementFromExtendable(extendable)

  const { root, id } = useIdentified({
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
      element: root.element,
      values: {
        htmlFor: labelledId,
      },
    })
  }

  return {
    root,
    id,
  }
}
