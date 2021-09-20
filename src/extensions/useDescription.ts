import { useIdentified } from '../extracted'
import type { SingleElement } from '../extracted'

export function useDescription (described: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  return useIdentified({
    identifying: described,
    attribute: 'ariaDescribedby'
  })
}
