import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable, SingleElement } from '../extracted'

export type Description = {
  root: SingleElement<HTMLElement>
}

export function useDescription (extendable: Extendable): Description {
  return useIdentified({
    identifying: ensureElementFromExtendable(extendable),
    attribute: 'ariaDescribedby'
  })
}
