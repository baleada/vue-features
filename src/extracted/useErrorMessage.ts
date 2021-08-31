import { useIdentified } from './useIdentified'
import type { SingleElement } from './useElements'

export function useErrorMessage (invalid: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  return useIdentified({
    identifying: invalid,
    attribute: 'ariaErrormessage'
  })
}
