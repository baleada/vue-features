import { watch } from 'vue'
import { createFocusable, createOmit } from '@baleada/logic'
import { useButton, useDialog } from '../interfaces'
import type {
  Button,
  Dialog,
  UseButtonOptions,
  UseDialogOptions,
} from '../interfaces'
import { bind } from '../affordances'
import { narrowTransitionOption, toTransitionWithFocus } from '../extracted'
import { usePopup, usePopupController } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'

export type Modal = {
  button: Button<false>,
  dialog: Dialog & Omit<Popup, 'status'> & {
    popupStatus: Popup['status'],
  },
}

export type UseModalOptions = {
  button?: Pick<UseButtonOptions, 'pressing'>
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
  usePopupController(button, { has: 'dialog' })
  const popup = usePopup(
          dialog,
          {
            ...popupOptions,
            rendering: {
              ...popupOptions?.rendering,
              show: {
                transition: toTransitionWithFocus(
                  dialog.root.element,
                  () => createFocusable('first')(dialog.root.element.value),
                  () => button.root.element.value,
                  {
                    transition: narrowTransitionOption(
                      dialog.root.element,
                      popupOptions?.rendering?.show?.transition || {}
                    ),
                  }
                ),
              },
            },
          }
        )

  watch(
    button.release,
    () => {
      if (popup.is.closed()) {
        popup.open()
        return
      }

      popup.close()
    },
  )


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
