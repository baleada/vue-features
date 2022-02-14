import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type {
  Button,
  Dialog,
  Listbox,
  Tablist,
  Textbox,
} from '../interfaces'

export type AnyInterface = Button<any>
  | Dialog
  | Listbox<any, any>
  | Tablist
  | Textbox

export type Extendable = Ref<HTMLElement> | AnyInterface

export function ensureElementFromExtendable (extendable: Extendable): Ref<HTMLElement> {
  if (isRef(extendable)) {
    return extendable
  }

  if (typeof extendable === 'function') {
    return computed(extendable)
  }

  return extendable.root.element
}
