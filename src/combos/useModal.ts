import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { createFocusable, createKeycomboMatch } from '@baleada/logic'
import { useButton } from '../interfaces'
import type { Button } from '../interfaces'
import { useWithRender } from '../extensions'
import type { WithRender } from '../extensions'
import { bind, on } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  narrowTransitionOption,
  useElementApi,
  toTransitionWithFocus,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type { ElementApi, TransitionOptionCreator, LabelMeta } from '../extracted'

// TODO: For a clearable listbox inside a dialog (does/should this happen?) the
// dialog should not close on ESC when the listbox has focus.

export type Modal = {
  button: Button<false>,
  dialog: {
    root: ElementApi<HTMLElement, true, LabelMeta>,
    status: ComputedRef<'opened' | 'closed'>,
    open: () => void,
    close: () => void,
    is: WithRender['is'] & {
      opened: () => boolean,
      closed: () => boolean,
    },
    renderStatus: WithRender['status'],
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
  const root = useElementApi({
    identifies: true,
    defaultMeta: defaultLabelMeta,
  })


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

  watch(button.release, open)

  on(
    root.element,
    {
      keydown: event => {
        if (createKeycomboMatch('esc')(event)) {
          if (status.value === 'opened') {
            event.preventDefault()
            close()
          }
        }
      },
    }
  )


  // FOCUS MANAGEMENT
  const toFirstWithFocus = createFocusable('first'),
        toLastWithFocus = createFocusable('last')

  on(
    root.element,
    {
      keydown: event => {
        if (createKeycomboMatch('shift+tab')(event)) {
          if (
            status.value === 'opened'
            && toFirstWithFocus(root.element.value) === document.activeElement
          ) {
            event.preventDefault()
            toLastWithFocus(root.element.value).focus()
          }

          return
        }

        if (createKeycomboMatch('tab')(event)) {
          if (
            status.value === 'opened'
            && toLastWithFocus(root.element.value) === document.activeElement
          ) {
            event.preventDefault()
            toFirstWithFocus(root.element.value).focus()
          }
        }
      },
    }
  )


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: alerts ? 'alertdialog' : 'dialog',
      ...toLabelBindValues(root),
      ariaModal: 'true',
    }
  )
  
  bind(
    button.root.element,
    { ariaHaspopup: 'dialog' }
  )


  // MULTIPLE CONCERNS
  const narrowedTransition = narrowTransitionOption(root.element, transition?.dialog || {}),
        withRender = useWithRender(root.element, {
          initialRenders: initialStatus === 'opened',
          show: {
            transition: toTransitionWithFocus(
              root.element,
              () => toFirstWithFocus(root.element.value),
              () => button.root.element.value,
              { transition: narrowedTransition }
            ),
          },
        })

  watch(
    status,
    () => {
      switch (status.value) {
        case 'opened':
          withRender.render()
          break
        case 'closed':
          withRender.remove()
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
        ...withRender.is,
      },
      renderStatus: withRender.status,
    },
  }
}
