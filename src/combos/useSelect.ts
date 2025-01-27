import { watch } from 'vue'
import { createDeepMerge, createOmit } from '@baleada/logic'
import {
  useButton,
  useListbox,
  type Button,
  type UseButtonOptions,
  type Listbox,
  type UseListboxOptions,
} from '../interfaces'
import { popupController } from  '../affordances'
import {
  usePopup,
  type Popup,
  type UsePopupOptions,
} from '../extensions'
import {
  popupList,
  type Orientation,
  useComboConditionalOptions,
} from '../extracted'

export type Select<
  Multiselectable extends boolean = false,
  O extends Orientation = 'vertical',
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
  O extends Orientation = 'vertical',
> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, Clears, O>,
  popup?: Omit<UsePopupOptions, 'trapsFocus' | 'closesOnEsc'>,
  focusesButtonAfterLeave?: boolean,
}

const defaultOptions: UseSelectOptions = {
  listbox: { clears: false },
  focusesButtonAfterLeave: true,
}

export function useSelect<
  Multiselectable extends boolean = false,
  Clears extends boolean = false,
  O extends Orientation = 'vertical',
> (options: UseSelectOptions<Multiselectable, Clears, O> = {}): Select<Multiselectable, O> {
  // OPTIONS
  const {
    button: buttonOptions,
    listbox: listboxOptions,
    popup: popupOptions,
    focusesButtonAfterLeave,
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
      closesOnEsc: false,
      conditional: useComboConditionalOptions({
        conditionalOptions: popupOptions?.conditional,
        controller: button,
        getFocusAfterEnterTarget: () => listbox.focusedElement.value,
        focusesControllerAfterLeave: focusesButtonAfterLeave,
        popupRoot: listbox.root,
      }),
    }
  )

  watch(button.firstPressDescriptor, popup.toggle)

  popupList({
    controllerApis: [button.root],
    popupApi: listbox.root,
    popup,
    getEscShouldClose: () => !listboxOptions.clears || !listbox.selected.value.length,
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
