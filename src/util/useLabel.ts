import type { Ref } from 'vue'
import { bind } from '../affordances/bind.js'
import { useSingleTarget } from './useSingleTarget'
import { useId } from './useId.js'

export function useLabel ({ text, labelled, feature }: { text: string, labelled: Element | Ref<Element>, feature: Record<any, any> }): void {
  const label = useSingleTarget(),
        labelId = text ? undefined : useId({ target: label.target })

  if (!text) {
    // If there is no ariaLabel, a ariaLabel target is required for accessibility.
    // This code will throw an error otherwise.
    bind({
      target: label.target,
      keys: { id: labelId },
    })

    feature.label = label.api
  }

  bind({
    target: labelled,
    keys: {
      [text ? 'ariaLabel' : 'ariaLabelledby']: text || labelId,
    }
  })
}
