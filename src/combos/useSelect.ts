import { watch } from 'vue'
import { createDeepMerge, createOmit } from '@baleada/logic'
import { useButton, useListbox } from '../interfaces'
import type {
  Button,
  UseButtonOptions,
  Listbox,
  UseListboxOptions,
} from '../interfaces'
import { popupController } from  '../affordances'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import {
  toTransitionWithFocus,
  narrowTransitionOption,
  popupList,
} from '../extracted'
import type { Orientation } from '../extracted'

export type Select<
  Multiselectable extends boolean = false,
  O extends Orientation = 'vertical'
> = {
  button: Button<false>,
  listbox: (
    & Listbox<Multiselectable, O>
    & Omit<Popup, 'status' | 'toggle'>
    & {
      is: Listbox['is'] & Popup['is'],
      popupStatus: Popup['status'],
      togglePopupStatus: Popup['toggle'],
    }
  ),
}

export type UseSelectOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  O extends Orientation = 'vertical'
> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, Clears, O>,
  popup?: Omit<UsePopupOptions, 'trapsFocus'>,
}

const defaultOptions: UseSelectOptions = {
  listbox: { clears: false },
}

export function useSelect<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  O extends Orientation = 'vertical'
> (options: UseSelectOptions<Multiselectable, Clears, O> = {}): Select<Multiselectable, O> {
  // OPTIONS
  const {
    button: buttonOptions,
    listbox: listboxOptions,
    popup: popupOptions,
  } = createDeepMerge(options)(defaultOptions as UseSelectOptions<Multiselectable, Clears, O>)


  // INTERFACES
  const button = useButton(buttonOptions)
  const listbox = useListbox(listboxOptions as UseListboxOptions<Multiselectable, Clears, O>)


  // POPUP
  popupController(button.root.element, { has: 'listbox' })
  const popup = usePopup(
    listbox,
    {
      ...popupOptions,
      trapsFocus: false,
      conditional: {
        ...popupOptions?.conditional,
        show: {
          transition: toTransitionWithFocus(
            {
              focusAfterEnter: () => {
                const effect = () => listbox.focusedElement.value?.focus()

                if (button.is.pressed()) {
                  const stop = watch(
                    button.releaseDescriptor,
                    () => {
                      stop()
                      effect()
                    }
                  )

                  return
                }

                effect()
              },
              focusAfterLeave: () => {}, // Don't focus button on click outside, ESC key handled separately
            },
            {
              transition: narrowTransitionOption(
                listbox.root.element,
                popupOptions?.conditional?.show?.transition || {}
              ),
            }
          ),
        },
      },
    }
  )

  watch(button.firstPressDescriptor, popup.toggle)

  popupList({
    controllerApis: [button.root],
    popupApi: listbox.root,
    popup,
    getEscShouldClose: () => (
      listboxOptions.clears
        ? !listbox.selected.value.length
        : !listbox.selectedOptions.multiple
    ),
    receivesFocus: true,
  })


  // API
  return {
    button,
    listbox: {
      ...listbox,
      ...createOmit<Popup, 'status' | 'toggle'>(['status', 'toggle'])(popup),
      is: {
        ...listbox.is,
        ...popup.is,
      },
      popupStatus: popup.status,
      togglePopupStatus: popup.toggle,
    },
  }
}
