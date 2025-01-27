import { watch } from 'vue'
import { createFocusable, createOmit } from '@baleada/logic'
import {
  useButton,
  useDialog,
  type Button,
  type Dialog,
  type UseButtonOptions,
  type UseDialogOptions,
} from '../interfaces'
import { bind, popupController } from '../affordances'
import { useComboConditionalOptions } from '../extracted'
import {
  usePopup,
  type Popup,
  type UsePopupOptions,
} from '../extensions'

export type Modal = {
  button: Button<false>,
  dialog: (
    & Dialog
    & Omit<Popup, 'status'>
    & {
      popupStatus: Popup['status'],
    }
  ),
}

export type UseModalOptions = {
  button?: Pick<UseButtonOptions, 'press'>,
  dialog?: UseDialogOptions,
  popup?: Omit<UsePopupOptions, 'has'>,
}

const defaultOptions: UseModalOptions = {}

export function useModal (options?: UseModalOptions): Modal {
  // OPTIONS
  const {
    button: buttonOptions,
    dialog: dialogOptions,
    popup: popupOptions,
  } = { ...defaultOptions, ...options }


  // INTERFACES
  const button = useButton(buttonOptions),
        dialog = useDialog(dialogOptions)


  // POPUP
  popupController(button.root.element, { has: 'dialog' })
  const popup = usePopup(
    dialog,
    {
      ...popupOptions,
      trapsFocus: true,
      conditional: useComboConditionalOptions({
        conditionalOptions: popupOptions?.conditional,
        controller: button,
        getFocusAfterEnterTarget: () => createFocusable('first')(dialog.root.element.value),
        focusesControllerAfterLeave: true,
        popupRoot: dialog.root,
      }),
    }
  )

  watch(button.firstPressDescriptor, popup.toggle)


  // BASIC BINDINGS
  bind(
    dialog.root.element,
    { ariaModal: 'true' }
  )


  // API
  return {
    button,
    dialog: {
      ...dialog,
      ...createOmit<Popup, 'status'>(['status'])(popup),
      popupStatus: popup.status,
    },
  }
}
