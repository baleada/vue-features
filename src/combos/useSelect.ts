import { watch, computed } from 'vue'
import type { Ref } from 'vue'
import { some } from 'lazy-collections'
import { createKeycomboMatch } from '@baleada/logic'
import { useButton, useListbox } from '../interfaces'
import type { Button, UseButtonOptions, Listbox, UseListboxOptions } from '../interfaces'
import { useRendering } from '../extensions'
import type { Rendering } from '../extensions'
import { bind, on } from  '../affordances'
import type { TransitionOption } from  '../affordances'
import { toTransitionWithFocus, narrowTransitionOption } from '../extracted'

export type Select<Multiselectable extends boolean = false> = {
  button: Button<false>,
  listbox: Listbox<Multiselectable, true>
    & {
      renderingStatus: Rendering['status']
      is: Listbox<Multiselectable, true>['is'] & Rendering['is'],
    },
}

export type UseSelectOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = {
  button?: UseButtonOptions<false>,
  listbox?: UseListboxOptions<Multiselectable, Clears, true>,
  transition?: {
    listbox?: TransitionOption<Ref<HTMLElement>>,
  }
}

const defaultOptions: UseSelectOptions<true> = {
  button: {},
  listbox: {},
}

export function useSelect<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> (options: UseSelectOptions<Multiselectable, Clears> = {}): Select<Multiselectable> {
  // OPTIONS
  const {
    button: buttonOptions,
    listbox: listboxOptions,
    transition,
  } = { ...defaultOptions, ...options }

  const button = useButton(buttonOptions)
  const listbox = useListbox({ ...(listboxOptions as UseListboxOptions<Multiselectable, Clears, true>), popsUp: true })


  // FOCUS MANAGEMENT
  on(
    listbox.root.element,
    {
      focusout: event => {
        if (
          !event.relatedTarget
          || (
            event.relatedTarget !== button.root.element.value
            && !some<Listbox['options']['list']['value'][0]>(element =>
              event.relatedTarget === element
            )(listbox.options.list.value)
          )
        ) {
          listbox.close()
        }
      },
    }
  )

  
  // STATUS
  watch(
    button.release,
    () => {
      if (listbox.status.value === 'closed') {
        listbox.open()
        return
      }

      listbox.close()
    },
  )

  on(
    listbox.options.list,
    {
      keydown: event => {
        for (const keycombo of ['esc', '!shift+tab', 'shift+tab']) {
          if (createKeycomboMatch(keycombo)(event)) {
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
      },
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
  const narrowedTransition = narrowTransitionOption(listbox.root.element, transition?.listbox || {}),
        rendering = useRendering(listbox.root.element, {
          initialRenders: listboxOptions.initialPopupStatus === 'opened',
          show: {
            transition: toTransitionWithFocus(
              listbox.root.element,
              () => listbox.options.list.value[listbox.focused.location],
              () => undefined, // Don't focus button on click outside, ESC key handled separately
              { transition: narrowedTransition }
            ),
          },
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
      is: {
        ...listbox.is,
        ...rendering.is,
      },
      renderingStatus: rendering.status,
    },
  }
}
