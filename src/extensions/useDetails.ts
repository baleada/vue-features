import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Details = { root: ReturnType<typeof useIdentified> }

export function useDetails (extendable: Extendable): Details {
  return {
    root: useIdentified({
      identifying: ensureElementFromExtendable(extendable),
      attribute: 'ariaDetails'
    })
  }
}
