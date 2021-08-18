import { bind } from '../affordances/bind'
import { useSingleTarget } from './useTargets'
import type { SingleTarget } from './useTargets'
import { useSingleId } from './useIds'

export function useDescription ({ uses, described, feature }: { uses: boolean, described: SingleTarget['target'], feature: Record<any, any> }): void {
  if (!uses) {
    return
  }

  const description = useSingleTarget(),
        descriptionId = useSingleId({ target: description.target })

  bind({
    target: description.target,
    values: { id: descriptionId },
  })

  bind({
    target: described,
    values: { ariaDescribedby: descriptionId }
  })
  
  feature.description = description.api
}
