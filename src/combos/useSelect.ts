import { watch, computed } from 'vue'
import { createDeepMerge } from '@baleada/logic'
import { useButton, useListbox } from '../interfaces'
import type {
  Button,
  UseButtonOptions,
  Listbox,
  UseListboxOptions,
} from '../interfaces'
import { bind, on, popupController } from  '../affordances'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import {
  toTransitionWithFocus,
  narrowTransitionOption,
  predicateEsc,
} from '../extracted'

export type Select<Multiselectable extends boolean = false> = {
  button: Button<false>,
  listbox: (
    & Listbox<Multiselectable>
    & {
      is: Listbox['is'] & Popup['is'],
      popupStatus: Popup['status'],
    }
  ),
}

export type UseSelectOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, Clears>,
  popup?: UsePopupOptions,
}

const defaultOptions: UseSelectOptions = {
  listbox: { clears: false },
  popup: { trapsFocus: false },
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
      rendering: {
        ...popupOptions?.rendering,
        show: {
          transition: toTransitionWithFocus(
            listbox.root.element,
            () => listbox.options.list.value[listbox.focused.location],
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
    listbox.root.element,
    {
      keydown: event => {
        if (
          predicateEsc(event)
          && (
            (
              !listboxOptions.clears
              && !listbox.selected.multiple
            )
            || (
              listboxOptions.clears
              && listbox.selected.picks.length === 0
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
      listbox.root.element,
      {
        focusout: event => {
          if (
            !event.relatedTarget
            || !(
              button.root.element.value.contains(event.relatedTarget as HTMLElement)
              || listbox.root.element.value.contains(event.relatedTarget as HTMLElement)
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
          ? listbox.root.id.value
          : undefined
      ),
    }
  )

  
  // API
  return {
    button,
    listbox: {
      ...listbox,
      is: {
        ...listbox.is,
        ...popup.is,
      },
      popupStatus: popup.status,
    },
  }
}
