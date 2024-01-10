import { watch, computed } from 'vue'
import type { Ref } from 'vue'
import { some } from 'lazy-collections'
import { createKeycomboMatch } from '@baleada/logic'
import { useButton, useMenubar } from '../interfaces'
import type { Button, UseButtonOptions, Menubar, UseMenubarOptions } from '../interfaces'
import { useRendering } from '../extensions'
import type { Rendering } from '../extensions'
import { bind, on } from  '../affordances'
import type { TransitionOption } from  '../affordances'
import { toTransitionWithFocus, narrowTransitionOption } from '../extracted'

export type Menu = {
  button: Button<false>,
  bar: Menubar<true> & {
    is: Menubar<true>['is'] & Rendering['is'],
    renderingStatus: Rendering['status'],
  },
}

export type UseMenuOptions = {
  button?: UseButtonOptions<false>,
  bar?: UseMenubarOptions<true>,
  transition?: {
    bar?: TransitionOption<Ref<HTMLElement>>,
  }
}

const defaultOptions: UseMenuOptions = {
  button: {},
  bar: {},
}

export function useMenu (options: UseMenuOptions = {}): Menu {
  // OPTIONS
  const {
    button: buttonOptions,
    bar: barOptions,
    transition,
  } = { ...defaultOptions, ...options }

  const button = useButton(buttonOptions)
  const bar = useMenubar({ ...(barOptions as UseMenubarOptions<true>), popsUp: true })


  // FOCUS MANAGEMENT
  // TODO: Abstract for menu, select, combobox
  on(
    bar.root.element,
    {
      focusout: event => {
        if (
          !event.relatedTarget
          || (
            event.relatedTarget as HTMLElement !== button.root.element.value
            && !some<Menubar['items']['list']['value'][0]>(element =>
              event.relatedTarget === element
            )(bar.items.list.value)
          )
        ) {
          bar.close()
        }
      },
    }
  )

  
  // STATUS
  watch(
    button.release,
    () => {
      if (bar.status.value === 'closed') {
        bar.open()
        return
      }

      bar.close()
    },
  )

  on(
    bar.items.list,
    {
      keydown: event => {
        for (const keycombo of ['esc', 'tab', 'shift+tab']) {
          if (createKeycomboMatch(keycombo)(event)) {
            // TODO: first esc should clear clearable bar, second esc should close bar.
            // first esc should close none-clearable bar.
            if (bar.status.value === 'opened') {
              event.preventDefault()
              bar.close()
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
      ariaHaspopup: 'menu',
      ariaExpanded: computed(() => `${bar.is.opened()}`),
      ariaControls: computed(() =>
        bar.is.opened()
          ? bar.root.id.value
          : undefined
      ),
    }
  )


  // MULTIPLE CONCERNS
  const narrowedTransition = narrowTransitionOption(bar.root.element, transition?.bar || {}),
        rendering = useRendering(bar.root.element, {
          initialRenders: barOptions.initialPopupStatus === 'opened',
          show: {
            transition: toTransitionWithFocus(
              bar.root.element,
              () => bar.items.list.value[bar.focused.location],
              () => undefined, // Don't focus button on click outside, ESC key handled separately
              { transition: narrowedTransition }
            ),
          },
        })

  watch(
    bar.status,
    () => {
      switch (bar.status.value) {
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
    bar: {
      ...bar,
      is: {
        ...bar.is,
        ...rendering.is,
      },
      renderingStatus: rendering.status,
    },
  }
}
