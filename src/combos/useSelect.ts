import { watch, computed } from 'vue'
import type { Ref } from 'vue'
import { useButton, useListbox } from '../interfaces'
import type { Button, UseButtonOptions, Listbox, UseListboxOptions } from "../interfaces"
import { bind, on } from  '../affordances'
import type { TransitionOption } from  '../affordances'
import { showAndFocusAfter } from '../extracted'
import { some } from 'lazy-collections'

export type Select<Multiselectable extends boolean = false> = {
  button: Button<false>,
  listbox: Listbox<Multiselectable, true>,
}

export type UseSelectOptions<Multiselectable extends boolean = false> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, true>,
  transition?: {
    listbox?: TransitionOption<Ref<HTMLElement>>,
  }
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
    transition,
  } = { ...defaultOptions, ...options }

  const button = useButton(buttonOptions)
  const listbox = useListbox({ ...(listboxOptions as UseListboxOptions<Multiselectable, true>), popup: true })


  // FOCUS MANAGEMENT
  on<'blur'>(
    listbox.options.elements,
    defineEffect => [
      defineEffect(
        'blur',
        event => {
          if (
            !event.relatedTarget
            || (
              !(event.relatedTarget as HTMLElement).isSameNode(button.root.element.value)
              && !some<Listbox['options']['elements']['value'][0]>(element =>
                (event.relatedTarget as HTMLElement).isSameNode(element)
              )(listbox.options.elements.value)
            )
          ) {
            listbox.close()
          }
        }
      )
    ]
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


  // MULTIPLE CONCERNS
  showAndFocusAfter(
    listbox.root.element,
    computed(() => listbox.is.opened()),
    () => listbox.options.elements.value[listbox.focused.value.location],
    () => button.root.element.value,
    { transition: transition?.listbox },
  )
  
  
  // API
  return {
    button,
    listbox,
  }
}
