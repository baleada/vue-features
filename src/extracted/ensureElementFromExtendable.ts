import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type { SingleElement } from './elementApi'

export type Extendable = 
  { root: SingleElement<HTMLElement> }
  | Ref<HTMLElement>

export function ensureElementFromExtendable (extendable: Extendable): Ref<HTMLElement> {
  if (isRef(extendable)) {
    return extendable
  }

  if (typeof extendable === 'function') {
    return computed(extendable)
  }

  return extendable.root.element
}
