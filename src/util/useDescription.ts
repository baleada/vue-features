import { bind } from '../affordances/bind.js'
import { useSingleTarget } from './useTargets'
import type { SingleTarget } from './useTargets'
import { useSingleId } from './useIds'

export function useDescription ({ uses, described, feature }: { uses: boolean, described: SingleTarget, feature: Record<any, any> }): void {
  if (!uses) {
    return
  }

  const description = useSingleTarget(),
        descriptionId = useSingleId({ target: description.target })

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
