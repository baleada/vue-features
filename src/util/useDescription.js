import { bind } from '../affordances/bind.js'
import { useTarget } from './useTarget.js'
import { useId } from './useId.js'

export function useDescription ({ uses, described, feature }) {
  if (!uses) {
    return
  }

  const description = useTarget('single'),
        descriptionId = useId({ target: description.target })

  bind({
    target: description.target,
    keys: { id: descriptionId },
  })

  bind({
    target: described.target,
    keys: { ariaDescribedby: descriptionId }
  })
  
  feature.description = description.api
}
