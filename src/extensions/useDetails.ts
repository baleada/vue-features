import { useIdentified, narrowElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Details = { root: ReturnType<typeof useIdentified> }

export function useDetails (extendable: Extendable): Details {
  return {
    root: useIdentified({
      identifying: narrowElementFromExtendable(extendable),
      attribute: 'ariaDetails'
    })
  }
}
