import { computed } from 'vue'
import { bind } from '../affordances/bind'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'
import { preventEffect } from './scheduleBind'
import { useIdentified } from './useIdentified'

export function useLabel (labelled: SingleElement<HTMLElement>['element'], { text, htmlFor }: { text?: string, htmlFor?: ReturnType<typeof useSingleId> } = {}): SingleElement<HTMLElement> {
  const label = useIdentified({
    identifying: labelled,
    attribute: 'ariaLabel',
  })

  bind({
    element: label.element,
    values: {
      htmlFor: computed(() => htmlFor.value ? htmlFor.value : preventEffect()),
    },
  })

  if (text) {
    bind({
      element: labelled,
      values: { ariaLabel: text }
    })
  }

  return label
}
