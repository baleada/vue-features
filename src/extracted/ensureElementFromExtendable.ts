import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type {
  Button,
  Checkbox,
  Link,
  Listbox,
  Tablist,
  Textbox,
} from '../interfaces'
import type {
  Modal,
} from '../combos'

export type AnyInterface = Button<any>
  | Checkbox
  | Link
  | Listbox<any, any>
  | Tablist
  | Textbox
  | Modal['dialog']

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
