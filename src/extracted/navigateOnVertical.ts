import { on } from '../affordances'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { createEligibleNavigation } from './createEligibleNavigation'

export function navigateOnVertical (
  { elementsApi, eligibleNavigation }: {
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    eligibleNavigation: ReturnType<typeof createEligibleNavigation>,
  }
) {
  on<'+down' | '+up' | 'ctrl+up' | 'cmd+up' | 'ctrl+down' | 'cmd+down'>({
    element: elementsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'down' as '+down',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
            eligibleNavigation.next(index)
          }
        }
      ),
      defineEffect(
        'up' as '+up',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
            eligibleNavigation.previous(index)
          }
        }
      ),
      
      ...(['ctrl+up', 'cmd+up'] as 'cmd+up'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          eligibleNavigation.first()
        }
      )),
      ...(['ctrl+down', 'cmd+down'] as 'cmd+down'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          eligibleNavigation.last()
        }
      )),
    ],
  })
}
