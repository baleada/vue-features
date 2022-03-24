import { join } from 'lazy-collections'
import { bind } from '../affordances/bind'
import { useElementApi } from './useElementApi'
import type { Api, IdentifiedListApi } from './useElementApi'

const toJoined = join('')

export function useListIdentified (
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
        get: index => identifieds.elements.value[index] ? identifieds.ids.value[index] : undefined,
        watchSource: identifieds.elements,
      }
    },
  )
  
  return identifieds
}
