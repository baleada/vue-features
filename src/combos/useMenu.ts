import { watch } from 'vue'
import { createDeepMerge, createOmit } from '@baleada/logic'
import { useButton, useMenubar } from '../interfaces'
import type {
  Button,
  UseButtonOptions,
  Menubar,
  UseMenubarOptions,
} from '../interfaces'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import { popupController } from  '../affordances'
import {
  toTransitionWithFocus,
  narrowTransitionOption,
  popupList,
} from '../extracted'

export type Menu<Multiselectable extends boolean = true> = {
  button: Button<false>,
  bar: (
    & Menubar<Multiselectable>
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
  Clears extends boolean = true
> = {
  button?: UseButtonOptions<false>,
  bar?: Omit<
    UseMenubarOptions<Multiselectable, Clears>,
    'visuallyPersists'
  >,
  popup?: Omit<UsePopupOptions, 'trapsFocus'>,
}

const defaultOptions: UseMenuOptions<true, true> = {
  bar: { multiselectable: true, clears: true },
}

export function useMenu<
  Multiselectable extends boolean = true,
  Clears extends boolean = true
> (options: UseMenuOptions<Multiselectable, Clears> = {}): Menu<Multiselectable> {
  // OPTIONS
  const {
    button: buttonOptions,
    bar: barOptions,
    popup: popupOptions,
  } = createDeepMerge(options)(defaultOptions as UseMenuOptions<Multiselectable, Clears>)


  // INTERFACES
  const button = useButton(buttonOptions)
  const bar = useMenubar({ ...barOptions, visuallyPersists: false } as UseMenubarOptions<Multiselectable, Clears>)


  // POPUP
  popupController(button.root.element, { has: 'menu' })
  const popup = usePopup(
    bar,
    {
      ...popupOptions,
      trapsFocus: false,
      rendering: {
        ...popupOptions?.rendering,
        show: {
          transition: toTransitionWithFocus(
            bar.root.element,
            () => bar.items.list.value[bar.focused.value],
            () => undefined, // Don't focus button on click outside, ESC key handled separately
            {
              transition: narrowTransitionOption(
                bar.root.element,
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
    popupApi: bar.root,
    popup,
    getEscShouldClose: () => (
      barOptions.clears
        ? !bar.selected.value.length
        : !bar.selectedItems.multiple
    ),
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
    } as Menu<Multiselectable>['bar'],
  }
}
