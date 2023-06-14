import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { useButton } from '../interfaces'
import type { Button } from '../interfaces'
import { useConditionalRendering } from '../extensions'
import type { ConditionalRendering } from '../extensions'
import { bind, on } from '../affordances'
import type { TransitionOption } from '../affordances'
import { narrowTransitionOption, useElementApi, toTransitionWithFocus } from '../extracted'
import type { IdentifiedElementApi, TransitionOptionCreator } from '../extracted'
import { createFocusable, createPredicateKeycomboMatch } from '@baleada/logic'

// TODO: For a clearable listbox inside a dialog (does/should this happen?) the
// dialog should not close on ESC when the listbox has focus.

// TODO: await status change

export type Modal = {
  button: Button<false>,
  dialog: {
    root: IdentifiedElementApi<HTMLElement>,
    status: ComputedRef<'opened' | 'closed'>,
    open: () => void,
    close: () => void,
    is: {
      opened: () => boolean,
      closed: () => boolean,
    },
    rendering: ConditionalRendering,
  },
}

export type UseModalOptions = {
  initialStatus?: 'opened' | 'closed',
  alerts?: boolean,
  transition?: {
    dialog?: TransitionOption<Modal['dialog']['root']['element']>
      | TransitionOptionCreator<Modal['dialog']['root']['element']>
  }
}

const defaultOptions: UseModalOptions = {
  initialStatus: 'closed',
  alerts: false,
}

export function useModal (options?: UseModalOptions): Modal {
  // OPTIONS
  const {
    initialStatus,
    alerts,
    transition,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root = useElementApi({ identified: true })


  // INTERFACES
  const button = useButton()
  

  // STATUS
  const status = ref<Modal['dialog']['status']['value']>(initialStatus),
        open = () => {
          status.value = 'opened'
        },
        close = () => {
          status.value = 'closed'
        }

  watch(button.pressing.release, open)

  on(
    root.element,
    {
      keydown: (event) => {
        if (createPredicateKeycomboMatch('esc')(event)) {
          if (status.value === 'opened') {
            event.preventDefault()
            close()
          }
        }
      }
    }
  )


  // FOCUS MANAGEMENT
  const toFirstFocusable = createFocusable('first', { elementIsCandidate: false }),
        toLastFocusable = createFocusable('last', { elementIsCandidate: false })

  on(
    root.element,
    {
      keydown: (event) => {
        if (createPredicateKeycomboMatch('shift+tab')(event)) {
          if (
            status.value === 'opened'
            && toFirstFocusable(root.element.value) === document.activeElement
          ) {
            event.preventDefault()
            toLastFocusable(root.element.value).focus()
          }

          return
        }

        if (createPredicateKeycomboMatch('tab')(event)) {
          if (
            status.value === 'opened'
            && toLastFocusable(root.element.value) === document.activeElement
          ) {
            event.preventDefault()
            toFirstFocusable(root.element.value).focus()
          }
        }
      }
    }
  )


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: alerts ? 'alertdialog' : 'dialog',
      ariaModal: 'true',
    }
  )
  
  bind(
    button.root.element,
    { ariaHaspopup: 'dialog' }
  )


  // MULTIPLE CONCERNS
  const narrowedTransition = narrowTransitionOption(root.element, transition?.dialog || {}),
        rendering = useConditionalRendering(root.element, {
          initialRenders: initialStatus === 'opened',
          show: {
            transition: toTransitionWithFocus(
              root.element,
              () => toFirstFocusable(root.element.value),
              () => button.root.element.value,
              { transition: narrowedTransition }
            )
          }
        })

  watch(
    status,
    () => {
      switch (status.value) {
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
    dialog: {
      root,
      status: computed(() => status.value),
      open,
      close,
      is: {
        opened: () => status.value === 'opened',
        closed: () => status.value === 'closed',
      },
      rendering,
    },
  }
}
