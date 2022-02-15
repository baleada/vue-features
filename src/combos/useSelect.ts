import { watch, nextTick, computed } from 'vue'
import { useButton, useListbox } from '../interfaces'
import type { Button, UseButtonOptions, Listbox, UseListboxOptions } from "../interfaces"
import { bind, on } from  '../affordances'

export type Select<Multiselectable extends boolean = false> = {
  button: Button<false>,
  listbox: Listbox<Multiselectable, true>,
}

export type UseSelectOptions<Multiselectable extends boolean = false> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, true>,
}

const defaultOptions: UseSelectOptions<true> = {
  button: {},
  listbox: {},
}

export function useSelect<Multiselectable extends boolean = false> (options: UseSelectOptions<Multiselectable> = {}): Select<Multiselectable> {
  // OPTIONS
  const {
    button: buttonOptions,
    listbox: listboxOptions,
  } = { ...defaultOptions, ...options }

  const button = useButton(buttonOptions)
  const listbox = useListbox({ ...(listboxOptions as UseListboxOptions<Multiselectable, true>), popup: true })
  
  
  // BASIC BINDINGS
  bind(
    button.root.element,
    {
      ariaHaspopup: 'listbox',
      ariaExpanded: computed(() => `${listbox.is.opened()}`),
      ariaControls: computed(() =>
        listbox.is.opened()
          ? listbox.root.id.value
          : undefined
      ),
    }
  )


  // FOCUS MANAGEMENT
  watch(
    listbox.status,
    () => {
      if (listbox.status.value === 'opened') {
        // Need to wait for next tick in case the popup is implemented as
        // a conditionally rendered component.
        nextTick(() => listbox.options.elements.value[listbox.focused.value.location].focus())
        return
      }

      button.root.element.value.focus()
    },
    { flush: 'post' }
  )

  
  // STATUS
  watch(
    button.clicked,
    () => {
      if (listbox.status.value === 'closed') {
        listbox.open()
        return
      }

      listbox.close()
    },
  )

  on<'+esc' | '!shift+tab' | 'shift+tab'>(
    listbox.options.elements,
    defineEffect => (['esc' as '+esc', '!shift+tab', 'shift+tab'] as '+esc'[]).map(name => defineEffect(
      name,
      event => {
        // TODO: first esc should clear clearable listbox, second esc should close listbox.
        // first esc should close none-clearable listbox.
        if (listbox.status.value === 'opened') {
          event.preventDefault()
          listbox.close()
        }
      }
    ))
  )

  
  // API
  return {
    button,
    listbox,
  }
}
