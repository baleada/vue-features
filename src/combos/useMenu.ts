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
    & Omit<Popup, 'status'>
    & {
      is: Menubar['is'] & Popup['is'],
      popupStatus: Popup['status'],
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
            () => bar.items.list.value[bar.focused.location],
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
    button.release,
    () => {
      if (popup.is.closed()) {
        popup.open()
        return
      }

      popup.close()
    },
  )

  popupList({
    controllerApis: [button.root],
    popupApi: bar.root,
    popup,
    getEscShouldClose: () => (
      barOptions.clears
        ? !bar.selected.picks.length
        : !bar.selected.multiple
    ),
    receivesFocus: true,
  })


  // API
  return {
    button,
    bar: {
      ...bar,
      ...createOmit<Popup, 'status'>(['status'])(popup),
      is: {
        ...bar.is,
        ...popup.is,
      },
      popupStatus: popup.status,
    } as Menu<Multiselectable>['bar'],
  }
}
