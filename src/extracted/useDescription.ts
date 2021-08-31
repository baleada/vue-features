import { useIdentified } from './useIdentified'
import type { SingleElement } from './useElements'

export function useDescription (described: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  return useIdentified({
    identifying: described,
    attribute: 'ariaDescribedby'
  })
}
