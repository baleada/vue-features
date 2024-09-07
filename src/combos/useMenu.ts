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
import type { Orientation } from '../extracted'

export type Menu<
  Multiselectable extends boolean = true,
  O extends Orientation = 'vertical'
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
  O extends Orientation = 'vertical'
> = {
  button?: Pick<UseButtonOptions<false>, 'press'>,
  bar?: Omit<
    UseMenubarOptions<Multiselectable, Clears, O>,
    'visuallyPersists'
  >,
  popup?: Omit<UsePopupOptions, 'trapsFocus'>,
}

const defaultOptions: UseMenuOptions<true, true, 'vertical'> = {
  bar: { multiselectable: true, clears: true },
}

export function useMenu<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical'
> (options: UseMenuOptions<Multiselectable, Clears, O> = {}): Menu<Multiselectable, O> {
  // OPTIONS
  const {
    button: buttonOptions,
    bar: barOptions,
    popup: popupOptions,
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
      conditional: {
        ...popupOptions?.conditional,
        show: {
          transition: toTransitionWithFocus(
            {
              focusAfterEnter: () => {
                const effect = () => bar.focusedElement.value?.focus()

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
              focusAfterLeave: () => {}, // Don't focus button on click outside, ESC key handled separately
            },
            {
              transition: narrowTransitionOption(
                bar.root.element,
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
    } as Menu<Multiselectable, O>['bar'],
  }
}
