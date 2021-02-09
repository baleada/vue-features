import { useBindings } from '../affordances'
import useTarget from './useTarget.js'
import useId from './useId.js'

export default function useDescription ({ uses, described, feature }) {
  if (!uses) {
    return
  }

  const description = useTarget('single'),
        descriptionId = useId({ target: description.target })

  useBindings({
    target: description.target,
    bindings: { id: descriptionId },
  })

  useBindings({
    target: described.target,
    bindings: { ariaDescribedby: descriptionId }
  })
  
  feature.description = description.handle
}
