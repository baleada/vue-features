import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type {
  Textbox,
  Tablist,
  Listbox,
} from '../interfaces'

export type Extendable = 
  Tablist
  | Listbox<any>
  | Textbox
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
