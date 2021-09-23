import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable, SingleElement } from '../extracted'

export type ErrorMessage = {
  root: SingleElement<HTMLElement>
}

export function useErrorMessage (extendable: Extendable): ErrorMessage {
  return {
    root: useIdentified({
      identifying: ensureElementFromExtendable(extendable),
      attribute: 'ariaErrormessage'
    })
  }
}
