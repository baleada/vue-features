import { inject, watch } from 'vue'
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
import {
  defaultPressInjection,
  narrowTransitionOption,
  PressInjectionKey,
  toTransitionWithFocus,
} from '../extracted'
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
  const { getStatus } = inject(PressInjectionKey, defaultPressInjection),
        popup = usePopup(
          dialog,
          {
            ...popupOptions,
            trapsFocus: true,
            conditional: {
              ...popupOptions?.conditional,
              show: {
                transition: toTransitionWithFocus(
                  {
                    focusAfterEnter: () => {
                      const effect = () => createFocusable('first')(dialog.root.element.value)?.focus()

                      if (button.is.pressed()) {
                        const stop = watch(
                          button.pressStatus,
                          status => {
                            if (status !== 'released') return
                            stop()
                            effect()
                          }
                        )

                        return
                      }

                      effect()
                    },
                    focusAfterLeave: () => {
                      const effect = () => button.root.element.value?.focus()

                      if (getStatus() === 'pressed') {
                        const stop = watch(
                          getStatus,
                          status => {
                            if (status !== 'released') return
                            stop()
                            effect()
                          }
                        )

                        return
                      }

                      effect()
                    },
                  },
                  {
                    transition: narrowTransitionOption(
                      dialog.root.element,
                      popupOptions?.conditional?.show?.transition || {}
                    ),
                  }
                ),
              },
            },
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
