import { computed } from 'vue'
import { bind } from '../affordances'
import { useElementApi } from './useElementApi'
import type { Api, UseElementOptions, IdentifiedElementApi } from './useElementApi'

export function useIdentified<Meta extends Record<any, any>> (
  { identifying, attribute, identified: identifiedOptions }: {
    identifying: Api<HTMLElement, 'element', false | true>['element'],
    attribute: string,
    identified?: Partial<Omit<UseElementOptions<'element', true, Meta>, 'kind' | 'identifies'>>
  }
): IdentifiedElementApi<HTMLElement, Meta> {
  const identified = useElementApi({
    identifies: true,
    defaultMeta: identifiedOptions?.defaultMeta || ({} as Meta),
  }) as IdentifiedElementApi<HTMLElement, Meta>

  bind(
    identified.element,
    { id: identified.id },
  )

  bind(
    identifying,
    { [attribute]: computed(() => identified.element.value ? identified.id.value : undefined) },
  )
  
  return identified
}
