import { on } from '../affordances'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { createEligibleNavigation } from './createEligibleNavigation'

export function navigateOnBasic (
  { elementsApi, eligibleNavigation }: {
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    eligibleNavigation: ReturnType<typeof createEligibleNavigation>,
  }
) {
  on<'+home' | '+end'>({
    element: elementsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          eligibleNavigation.first()
        }
      ),
      defineEffect(
        'end' as '+end',
        event => {
          event.preventDefault()
          eligibleNavigation.last()
        }
      ),
    ],
  })
}
