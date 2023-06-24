import { useIdentified, narrowElement } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Description = { root: ReturnType<typeof useIdentified> }

export function useDescription (extendable: ExtendableElement): Description {
  return {
    root: useIdentified({
      identifying: narrowElement(extendable),
      attribute: 'ariaDescribedbys'
    })
  }
}
