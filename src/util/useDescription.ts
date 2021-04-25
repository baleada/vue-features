import { bind } from '../affordances/bind.js'
import { useSingleTarget } from './useSingleTarget'
import { useId } from './useId.js'

export function useDescription ({ uses, described, feature }: { uses: boolean, described: Element | Ref<Element>, feature: Record<any, any> }): void {
  if (!uses) {
    return
  }

  const description = useSingleTarget(),
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
