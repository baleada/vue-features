import { computed, isRef, type Ref } from 'vue'
import {
  type Button,
  type Checkbox,
  type Dialog,
  type Grid,
  type Link,
  type Listbox,
  type Menubar,
  type Separator,
  type Tablist,
  type Textbox,
} from '../interfaces'
import { type SupportedElement } from './toRenderedKind'

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
