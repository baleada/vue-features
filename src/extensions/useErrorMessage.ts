import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type ErrorMessage = ReturnType<typeof useIdentified>

export function useErrorMessage (extendable: Extendable): ErrorMessage {
  return useIdentified({
    identifying: ensureElementFromExtendable(extendable),
    attribute: 'ariaErrormessage'
  })
}
