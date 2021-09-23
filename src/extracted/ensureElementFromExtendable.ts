import { computed } from 'vue'
import type { Ref } from 'vue'
import type { SingleElement } from './elementApi'

export type Extendable = { root: SingleElement<HTMLElement> } | (() => HTMLElement)

export function ensureElementFromExtendable (extendable: Extendable): Ref<HTMLElement> {
  if (typeof extendable !== 'function') {
    return extendable.root.element
  }

  return computed(extendable)
}
