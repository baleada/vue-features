import bind from '../affordances/bind.js'
import useTarget from './useTarget.js'
import useId from './useId.js'

export default function useDescription ({ uses, described, feature }) {
  if (!uses) {
    return
  }

  const description = useTarget('single'),
        descriptionId = useId({ target: description.target })

  bind({
    target: description.target,
    attributes: { id: descriptionId },
  })

  bind({
    target: described.target,
    attributes: { ariaDescribedby: descriptionId }
  })
  
  feature.description = description.api
}
