import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { Api, IdentifiedListApi } from './useElementApi'

export function useListIdentifieds (
  { identifying, attribute }: { identifying: Api<HTMLElement, 'list', false | true>['elements'], attribute: string }
): IdentifiedListApi<HTMLElement> {
  const identifieds = useElementApi({ kind: 'list', identified: true })

  bind(
    identifieds.elements,
    { id: index => identifieds.ids.value[index] },
  )

  bind(
    identifying,
    {
      [attribute]: {
        get: index => identifieds.ids.value[index],
        watchSource: identifieds.elements,
      }
    },
  )
  
  return identifieds
}
