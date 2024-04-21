import { Navigateable } from '@baleada/logic'
import type { ListApi } from './useListApi'

export type ToListEligibility = (index: number) => 'eligible' | 'ineligible'

export type ToEligible = ({ index, toEligibility, loops }: {
  index: number,
  toEligibility: ToListEligibility,
  loops: boolean,
}) => number | 'none'

export function createToNextEligible({ api }: { api: ListApi<HTMLElement, true> }) {
  return ({ index, toEligibility, loops }: {
    index: number,
    toEligibility: ToListEligibility,
    loops: boolean,
  }) => {
    if (api.list.value.length === 0) return 'none'

    const limit = loops
            ? index < 1
              ? api.list.value.length - 1
              : index - 1
            : api.list.value.length - 1,
          n = new Navigateable(api.list.value).navigate(index, { allow: 'any' })

    let nextEligible: number | 'none' = 'none',
        didReachLimit = n.location === n.array.length - 1 && !loops

    while (nextEligible === 'none' && !didReachLimit) {
      n.next({ loops })
      didReachLimit = n.location === limit

      if (toEligibility(n.location) === 'eligible') {
        nextEligible = n.location
      }
    }

    return nextEligible
  }
}

export function createToPreviousEligible ({ api }: { api: ListApi<HTMLElement> }) {
  return ({ index, toEligibility, loops }: {
    index: number,
    toEligibility: ToListEligibility,
    loops: boolean,
  }) => {
    if (api.list.value.length === 0) return 'none'

    const limit = loops
            ? index > api.list.value.length - 2
              ? 0
              : index + 1
            : 0,
          n = new Navigateable(api.list.value).navigate(index, { allow: 'any' })

    let previousEligible: number | 'none' = 'none',
        didReachLimit = n.location === 0 && !loops

    while (previousEligible === 'none' && !didReachLimit) {
      n.previous({ loops })
      didReachLimit = n.location === limit

      if (toEligibility(n.location) === 'eligible') {
        previousEligible = n.location
      }
    }

    return previousEligible
  }
}
