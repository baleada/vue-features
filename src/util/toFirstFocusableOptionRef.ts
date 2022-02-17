import { toMultiRef } from './toMultiRef'
import type { SupportedElement } from '../extracted'
import type { Listbox } from '../interfaces'
import type { Modal } from '../combos'

export function toFirstFocusableOptionRef (index: number, listbox: Listbox<any>, modal: Modal): (el: SupportedElement) => void {
  if (listbox.is.focused(index)) {
    return toMultiRef(modal.dialog.firstFocusable.ref, listbox.options.getRef(index))
  }

  return el => {
    listbox.options.getRef(index)(el)
  }
}
