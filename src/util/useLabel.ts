import type { Ref } from 'vue'
import { bind } from '../affordances/bind'
import { useSingleTarget } from './useTargets'
import type { SingleTarget } from './useTargets'
import { useSingleId } from './useIds.js'

export function useLabel ({ text, labelled, feature }: { text: string, labelled: SingleTarget, feature: Record<any, any> }): void {
  const label = useSingleTarget(),
        labelId = text ? undefined : useSingleId({ target: label.target })

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
    target: labelled.target,
    keys: {
      [text ? 'ariaLabel' : 'ariaLabelledby']: text || labelId,
    }
  })
}
