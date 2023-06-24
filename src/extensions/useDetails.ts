import { useIdentified, narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Details = { root: ReturnType<typeof useIdentified> }

export function useDetails (extendable: ExtendableElement): Details {
  return {
    root: useIdentified({
      identifying: narrowElement(extendable),
      attribute: 'ariaDetails',
    }),
  }
}
