import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type {
  Button,
  Checkbox,
  Dialog,
  Grid,
  Link,
  Listbox,
  Menubar,
  Separator,
  Tablist,
  Textbox,
} from '../interfaces'
import type { SupportedElement } from './toRenderedKind'

export type AnyInterface = (
  | Button
  | Checkbox
  | Dialog
  | Grid
  | Link
  | Listbox
  | Menubar
  | Separator
  | Tablist
  | Textbox
)

export type ExtendableElement = Ref<SupportedElement | undefined> | AnyInterface

export function narrowElement (extendable: ExtendableElement): Ref<SupportedElement> {
  if (isRef(extendable)) return extendable

  if (typeof extendable === 'function') return computed(extendable)

  return extendable.root.element
}
