import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable, SingleElement } from '../extracted'

export type Details = {
  root: SingleElement<HTMLElement>
}

export function useDetails (extendable: Extendable): Details {
  return {
    root: useIdentified({
      identifying: ensureElementFromExtendable(extendable),
      attribute: 'ariaDetails'
    })
  }
}
