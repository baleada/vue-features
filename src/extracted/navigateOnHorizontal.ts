import { on } from '../affordances'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { createEligibleNavigation } from './createEligibleNavigation'

export function navigateOnHorizontal (
  { elementsApi, eligibleNavigation }: {
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    eligibleNavigation: ReturnType<typeof createEligibleNavigation>,
  }
) {
  on<'+right' | '+left' | 'ctrl+left' | 'cmd+left' | 'ctrl+right' | 'cmd+right'>({
    element: elementsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'right' as '+right',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
            eligibleNavigation.next(index)
          }
        }
      ),
      defineEffect(
        'left' as '+left',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
            eligibleNavigation.previous(index)
          }
        }
      ),
      ...(['ctrl+left', 'cmd+left'] as 'cmd+left'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          eligibleNavigation.first()
        }
      )),
      ...(['ctrl+right', 'cmd+right'] as 'cmd+right'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          eligibleNavigation.last()
        }
      )),
    ],
  })
}
