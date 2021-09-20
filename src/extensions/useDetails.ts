import { useIdentified } from '../extracted'
import type { SingleElement } from '../extracted'

export function useDetails (detailed: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  return useIdentified({
    identifying: detailed,
    attribute: 'ariaDetails'
  })
}
