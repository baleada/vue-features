import { bind } from '../affordances/bind'
import { useSingleTarget } from './useElements'
import type { SingleTarget } from './useElements'
import { useSingleId } from './useIds'

export function useLabel ({ text, labelled, feature }: { text: string, labelled: SingleTarget['target'], feature: Record<any, any> }): void {
  const label = useSingleTarget(),
        labelId = text ? undefined : useSingleId({ element: label.element })

  if (!text) {
    // If there is no ariaLabel, a ariaLabel target is required for accessibility.
    // This code will throw an error otherwise.
    bind({
      element: label.element,
      values: { id: labelId },
    })

    feature.label = label.api
  }

  bind({
    target: labelled,
    values: {
      [text ? 'ariaLabel' : 'ariaLabelledby']: text || labelId,
    }
  })
}
