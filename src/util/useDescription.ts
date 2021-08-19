import { bind } from '../affordances/bind'
import { useSingleElement } from './useElements'
import type { SingleElement } from './useElements'
import { useSingleId } from './useIds'

export function useDescription ({ uses, described, feature }: { uses: boolean, described: SingleElement['element'], feature: Record<any, any> }): void {
  if (!uses) {
    return
  }

  const description = useSingleElement(),
        descriptionId = useSingleId({ element: description.element })

  bind({
    element: description.element,
    values: { id: descriptionId },
  })

  bind({
    element: described,
    values: { ariaDescribedby: descriptionId }
  })
  
  feature.description = description.api
}
