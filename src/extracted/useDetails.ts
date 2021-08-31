import { useIdentified } from './useIdentified'
import type { SingleElement } from './useElements'

export function useDetails (detailed: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  return useIdentified({
    identifying: detailed,
    attribute: 'ariaDetails'
  })
}
