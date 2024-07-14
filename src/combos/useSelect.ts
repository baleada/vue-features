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

export type Select<Multiselectable extends boolean = false> = {
  button: Button<false>,
  listbox: (
    & Listbox<Multiselectable>
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
  Clears extends boolean = false
> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, Clears>,
  popup?: Omit<UsePopupOptions, 'trapsFocus'>,
}

const defaultOptions: UseSelectOptions = {
  listbox: { clears: false },
}

export function useSelect<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> (options: UseSelectOptions<Multiselectable, Clears> = {}): Select<Multiselectable> {
  // OPTIONS
  const {
    button: buttonOptions,
    listbox: listboxOptions,
    popup: popupOptions,
  } = createDeepMerge(options)(defaultOptions as UseSelectOptions<Multiselectable, Clears>)


  // INTERFACES
  const button = useButton(buttonOptions)
  const listbox = useListbox(listboxOptions as UseListboxOptions<Multiselectable, Clears>)


  // POPUP
  popupController(button.root.element, { has: 'listbox' })
  const popup = usePopup(
    listbox,
    {
      ...popupOptions,
      trapsFocus: false,
      rendering: {
        ...popupOptions?.rendering,
        show: {
          transition: toTransitionWithFocus(
            listbox.root.element,
            () => listbox.options.list.value[listbox.focused.value],
            () => undefined, // Don't focus button on click outside, ESC key handled separately
            {
              transition: narrowTransitionOption(
                listbox.root.element,
                popupOptions?.rendering?.show?.transition || {}
              ),
            }
          ),
        },
      },
    }
  )

  watch(
    button.press,
    (current, previous) => {
      if (current.sequence[0] === previous?.sequence[0]) return
      popup.toggle()
    },
  )

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
