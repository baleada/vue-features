import type { Ref } from 'vue'
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
  element: HTMLElement | Ref<HTMLElement>,
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
