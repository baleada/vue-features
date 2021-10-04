import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Details = ReturnType<typeof useIdentified>

export function useDetails (extendable: Extendable): Details {
  return useIdentified({
    identifying: ensureElementFromExtendable(extendable),
    attribute: 'ariaDetails'
  })
}
