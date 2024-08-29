import type { Ref } from 'vue'
import type { SupportedElement } from '../extracted'
import { bind } from './bind'

export type PopupControllerOptions = {
  has?:
    | 'true'
    | 'false'
    | 'dialog'
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
}

const defaultOptions: PopupControllerOptions = {
  has: 'false',
}

export function popupController (
  element: SupportedElement | Ref<SupportedElement>,
  options: PopupControllerOptions = {},
) {
  // OPTIONS
  const {
    has,
  } = { ...defaultOptions, ...options }


  // BASIC BINDINGS
  bind(
    element,
    { ariaHaspopup: has }
  )
}
