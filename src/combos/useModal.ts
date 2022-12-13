import { ref, computed, watch, nextTick } from 'vue'
import type { ComputedRef } from 'vue'
import { useButton } from '../interfaces'
import type { Button } from '../interfaces'
import { useConditionalRendering } from '../extensions'
import type { ConditionalRendering } from '../extensions'
import { bind, on } from '../affordances'
import type { TransitionOption } from '../affordances'
import { ensureTransitionOption, useElementApi, toTransitionWithFocus } from '../extracted'
import type { IdentifiedElementApi, ElementApi, TransitionOptionCreator, TransitionEffects } from '../extracted'

// TODO: For a clearable listbox inside a dialog (does/should this happen?) the
// dialog should not close on ESC when the listbox has focus.

export type Modal = {
  button: Button<false>,
  dialog: {
    root: IdentifiedElementApi<HTMLElement>,
    firstFocusable: ElementApi<HTMLElement>,
    lastFocusable: ElementApi<HTMLElement>,
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
  const root = useElementApi({ identified: true }),
        firstFocusable = useElementApi(),
        lastFocusable = useElementApi()


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

  watch(
    button.event,
    () => {
      open()
    }
  )

  on(
    root.element,
    {
      keydown: (event, { matches }) => {
        if (matches('esc')) {
          if (status.value === 'opened') {
            event.preventDefault()
            close()
          }
        }
      }
    }
  )


  // FOCUS MANAGEMENT
  on(
    firstFocusable.element,
    {
      keydown: (event, { matches }) => {
        if (matches('shift+tab')) {
          if (status.value === 'opened') {
            event.preventDefault()
            lastFocusable.element.value.focus()
          }
        }
      }
    }
  )
  
  on(
    lastFocusable.element,
    {
      keydown: (event, { matches }) => {
        if (matches('!shift+tab')) {
          if (status.value === 'opened') {
            event.preventDefault()
            firstFocusable.element.value.focus()
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
  const ensuredTransition = ensureTransitionOption(root.element, transition?.dialog || {}),
        rendering = useConditionalRendering(root.element, {
          initialRenders: initialStatus === 'opened',
          show: {
            transition: toTransitionWithFocus(
              root.element,
              () => firstFocusable.element.value,
              () => button.root.element.value,
              { transition: ensuredTransition }
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
      firstFocusable,
      lastFocusable,
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
