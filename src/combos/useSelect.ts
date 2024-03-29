import { watch, computed } from 'vue'
import type { Ref } from 'vue'
import { useButton, useListbox } from '../interfaces'
import type { Button, UseButtonOptions, Listbox, UseListboxOptions } from "../interfaces"
import { useConditionalRendering } from '../extensions'
import type { ConditionalRendering } from '../extensions'
import { bind, on } from  '../affordances'
import type { TransitionOption } from  '../affordances'
import { toTransitionWithFocus, ensureTransitionOption } from '../extracted'
import { some } from 'lazy-collections'

export type Select<Multiselectable extends boolean = false> = {
  button: Button<false>,
  listbox: Listbox<Multiselectable, true> & { rendering: ConditionalRendering },
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
  on(
    listbox.root.element,
    {
      focusout: event => {
        if (
          !event.relatedTarget
          || (
            event.relatedTarget !== button.root.element.value
            && !some<Listbox['options']['elements']['value'][0]>(element =>
              event.relatedTarget === element
            )(listbox.options.elements.value)
          )
        ) {
          listbox.close()
        }
      }
    }
  )

  
  // STATUS
  watch(
    button.event,
    () => {
      if (listbox.status.value === 'closed') {
        listbox.open()
        return
      }

      listbox.close()
    },
  )

  on(
    listbox.options.elements,
    {
      keydown: (event, { is }) => {
        for (const keycombo of ['esc', '!shift+tab', 'shift+tab']) {
          if (is(keycombo)) {
            // TODO: first esc should clear clearable listbox, second esc should close listbox.
            // first esc should close none-clearable listbox.
            if (listbox.status.value === 'opened') {
              event.preventDefault()
              listbox.close()
              requestAnimationFrame(() => button.root.element.value.focus())
            }

            return
          }
        }
      }
    }
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
  const ensuredTransition = ensureTransitionOption(listbox.root.element, transition?.listbox || {}),
        rendering = useConditionalRendering(listbox.root.element, {
          initialRenders: listboxOptions.initialPopupTracking === 'opened',
          show: {
            transition: toTransitionWithFocus(
              listbox.root.element,
              () => listbox.options.elements.value[listbox.focused.value.location],
              () => undefined, // Don't focus button on click outside, ESC key handled separately
              { transition: ensuredTransition }
            )
          }
        })

  watch(
    listbox.status,
    () => {
      switch (listbox.status.value) {
        case 'opened':
          rendering.render()
          break
        case 'closed':
          rendering.remove()
          break
      }
    }
  )
  
  
  // API
  return {
    button,
    listbox: {
      ...listbox,
      rendering,
    },
  }
}
