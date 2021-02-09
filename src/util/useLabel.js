import { useBindings } from '../affordances'
import useTarget from './useTarget.js'
import useId from './useId.js'

export default function useLabel ({ text, labelled, feature }) {
  const label = useTarget('single'),
        labelId = text ? undefined : useId({ target: label.target })

  if (!text) {
    // If there is no ariaLabel, a ariaLabel target is required for accessibility.
    // This code will throw an error otherwise.
    useBindings({
      target: label.target,
      bindings: { id: labelId },
    })

    feature.label = label.handle
  }

  useBindings({
    target: labelled,
    bindings: {
      [text ? 'ariaLabel' : 'ariaLabelledby']: text || labelId,
    }
  })
}
