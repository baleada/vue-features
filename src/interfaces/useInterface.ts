import { SingleElement, useSingleElement } from '../extracted'
import type { SupportedElement } from '../extracted'

export type Interface<ElementType extends SupportedElement> = {
  root: SingleElement<ElementType>
}

export function useInterface<ElementType extends SupportedElement> (): Interface<ElementType> {
  const root = useSingleElement<ElementType>()
  
  return { root }
}
