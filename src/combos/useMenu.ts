import { watch, computed } from 'vue'
import { createDeepMerge } from '@baleada/logic'
import { useButton, useMenubar } from '../interfaces'
import type { Button, UseButtonOptions, Menubar, UseMenubarOptions } from '../interfaces'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import { bind, on, popupController } from  '../affordances'
import { toTransitionWithFocus, narrowTransitionOption, predicateEsc } from '../extracted'

export type Menu<Multiselectable extends boolean = true> = {
  button: Button<false>,
  bar: (
    & Menubar<Multiselectable>
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
  bar?: UseMenubarOptions<Multiselectable, Clears>,
  popup?: UsePopupOptions,
}

const defaultOptions: UseMenuOptions<true, true> = {
  bar: { multiselectable: true, clears: true },
  popup: { trapsFocus: false },
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
  const bar = useMenubar({ ...barOptions, visuallyPersists: false })


  // POPUP
  popupController(button.root.element, { has: 'menu' })
  const popup = usePopup(
    bar,
    {
      ...popupOptions,
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

  on(
    bar.root.element,
    {
      keydown: event => {
        if (
          predicateEsc(event)
          && (
            (
              !barOptions.clears
              && !bar.selected.multiple
            )
            || (
              barOptions.clears
              && bar.selected.picks.length === 0
            )
          )
        ) {
          event.preventDefault()

          const stop = watch(
            () => popup.is.removed(),
            is => {
              if (!is) return
              
              stop()
              button.root.element.value.focus()
            }
          )

          popup.close()
        }
      },
    }
  )

  if (!popupOptions.trapsFocus) {
    on(
      bar.root.element,
      {
        focusout: event => {
          if (
            !event.relatedTarget
            || !(
              button.root.element.value.contains(event.relatedTarget as HTMLElement)
              || bar.root.element.value.contains(event.relatedTarget as HTMLElement)
            )
          ) popup.close()
        },
      }
    )
  }

  
  // BASIC BINDINGS
  bind(
    button.root.element,
    {
      ariaExpanded: computed(() => `${popup.is.opened()}`),
      ariaControls: computed(() =>
        popup.is.opened()
          ? bar.root.id.value
          : undefined
      ),
    }
  )
  
  
  // API
  return {
    button,
    bar: {
      ...bar,
      is: {
        ...bar.is,
        ...popup.is,
      },
      popupStatus: popup.status,
    } as Menu<Multiselectable>['bar'],
  }
}
