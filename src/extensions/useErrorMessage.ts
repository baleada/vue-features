import { useIdentified } from '../extracted'
import type { SingleElement } from '../extracted'

export function useErrorMessage (invalid: SingleElement<HTMLElement>['element']): SingleElement<HTMLElement> {
  // TODO: bind ariaInvalid
  return useIdentified({
    identifying: invalid,
    attribute: 'ariaErrormessage'
  })
}
