import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { Api, IdentifiedPlaneApi } from './useElementApi'

export function usePlaneIdentifieds (
  { identifying, attribute }: { identifying: Api<HTMLElement, 'plane', false | true>['elements'], attribute: string }
): IdentifiedPlaneApi<HTMLElement> {
  const identifieds = useElementApi({ kind: 'plane', identified: true })

  bind(
    identifieds.elements,
    { id: (row, column) => identifieds.ids.value[row][column] },
  )

  bind(
    identifying,
    {
      [attribute]: {
        get: (row, column) => identifieds.ids.value[row]?.[column],
        watchSource: identifieds.elements,
      }
    },
  )
  
  return identifieds
}
