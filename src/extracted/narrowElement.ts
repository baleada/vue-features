import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type {
  Button,
  Checkbox,
  Grid,
  Link,
  Listbox,
  Menubar,
  Tablist,
  Textbox,
} from '../interfaces'
import type {
  Modal,
} from '../combos'

export type AnyInterface = Button<any>
  | Checkbox
  | Grid<any, any>
  | Link
  | Listbox<any, any>
  | Menubar
  | Modal['dialog']
  | Tablist
  | Textbox

export type ExtendableElement = Ref<HTMLElement> | AnyInterface

export function narrowElement (extendable: ExtendableElement): Ref<HTMLElement> {
  if (isRef(extendable)) return extendable

  if (typeof extendable === 'function') return computed(extendable)

  return extendable.root.element
}
