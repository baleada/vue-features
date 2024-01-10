import type { ExtendableElement } from '../extracted'
import { narrowElement } from '../extracted'
import { bind } from '../affordances'

export type PopupController = {}

export type UsePopupControllerOptions = {
  has?:
    | 'true'
    | 'false'
    | 'dialog'
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
}

const defaultOptions: UsePopupControllerOptions = {
  has: 'false',
}

export function usePopupController (
  extendable: ExtendableElement,
  options: UsePopupControllerOptions = {},
): PopupController {
  // OPTIONS
  const {
    has,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const element = narrowElement(extendable)

  
  // BASIC BINDINGS
  bind(
    element,
    { ariaHaspopup: has }
  )

  
  // API
  return {}
}
