import { watch } from 'vue'
import { createDeepMerge, createOmit } from '@baleada/logic'
import {
  useButton,
  useMenubar,
  type Button,
  type UseButtonOptions,
  type Menubar,
  type UseMenubarOptions,
} from '../interfaces'
import {
  usePopup,
  type Popup,
  type UsePopupOptions,
} from '../extensions'
import { popupController } from  '../affordances'
import {
  popupList,
  type Orientation,
  useComboConditionalOptions,
} from '../extracted'

export type Menu<
  Multiselectable extends boolean = true,
  O extends Orientation = 'vertical',
> = {
  button: Button<false>,
  bar: (
    & Menubar<Multiselectable, O>
    & Omit<Popup, 'status' | 'toggle'>
    & {
      is: Menubar['is'] & Popup['is'],
      popupStatus: Popup['status'],
      togglePopupStatus: Popup['toggle'],
    }
  ),
}

export type UseMenuOptions<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
> = {
  button?: Pick<UseButtonOptions<false>, 'press'>,
  bar?: Omit<
    UseMenubarOptions<Multiselectable, Clears, O>,
    'visuallyPersists'
  >,
  popup?: Omit<UsePopupOptions, 'trapsFocus' | 'closesOnEsc'>,
  focusesButtonAfterLeave?: boolean,
}

const defaultOptions: UseMenuOptions<true, true, 'vertical'> = {
  bar: { multiselectable: true, clears: true },
  focusesButtonAfterLeave: true,
}

export function useMenu<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
> (options: UseMenuOptions<Multiselectable, Clears, O> = {}): Menu<Multiselectable, O> {
  // OPTIONS
  const {
    button: buttonOptions,
    bar: barOptions,
    popup: popupOptions,
    focusesButtonAfterLeave,
  } = createDeepMerge(options)(defaultOptions as UseMenuOptions<Multiselectable, Clears, O>)


  // INTERFACES
  const button = useButton(buttonOptions)
  const bar = useMenubar({ ...barOptions, visuallyPersists: false } as UseMenubarOptions<Multiselectable, Clears, O>)


  // POPUP
  popupController(button.root.element, { has: 'menu' })
  const popup = usePopup(
    bar,
    {
      ...popupOptions,
      trapsFocus: false,
      closesOnEsc: false,
      conditional: useComboConditionalOptions({
        conditionalOptions: popupOptions?.conditional,
        controller: button,
        getFocusAfterEnterTarget: () => bar.focusedElement.value,
        focusesControllerAfterLeave: focusesButtonAfterLeave,
        popupRoot: bar.root,
      }),
    }
  )

  watch(button.firstPressDescriptor, popup.toggle)

  popupList({
    controllerApis: [button.root],
    popupApi: bar.root,
    popup,
    getEscShouldClose: () => !barOptions.clears || !bar.selected.value.length,
    receivesFocus: true,
  })


  // API
  return {
    button,
    bar: {
      ...bar,
      ...createOmit<Popup, 'status' | 'toggle'>(['status', 'toggle'])(popup),
      is: {
        ...bar.is,
        ...popup.is,
      },
      popupStatus: popup.status,
      togglePopupStatus: popup.toggle,
    } as Menu<Multiselectable, O>['bar'],
  }
}
