import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { createFocusable } from '@baleada/logic'
import type { ExtendableElement, SupportedElement } from '../extracted'
import { narrowElement, predicateEsc } from '../extracted'
import { on } from '../affordances'
import {
  useConditional,
} from './useConditional'
import type { Conditional, UseConditionalOptions } from './useConditional'

export type Popup = {
  status: Ref<PopupStatus>,
  open: () => PopupStatus,
  close: () => PopupStatus,
  toggle: () => PopupStatus,
  is: Conditional['is'] & {
    opened: () => boolean,
    closed: () => boolean,
  }
  conditionalStatus: Conditional['status'],
}

type PopupStatus = 'opened' | 'closed'

export type UsePopupOptions = {
  initialStatus?: PopupStatus,
  trapsFocus?: boolean,
  conditional?: Omit<UseConditionalOptions, 'initialRenders'>,
}

const defaultOptions: UsePopupOptions = {
  initialStatus: 'closed',
  trapsFocus: false,
}

export function usePopup (
  extendable: ExtendableElement,
  options: UsePopupOptions = {},
): Popup {
  // OPTIONS
  const {
    initialStatus,
    trapsFocus,
    conditional: conditionalOptions,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const element = narrowElement(extendable)


  // STATUS
  const status: Popup['status'] = ref(initialStatus),
        toggle: Popup['toggle'] = () => status.value = status.value === 'opened'
          ? 'closed'
          : 'opened',
        open: Popup['open'] = () => status.value = 'opened',
        close: Popup['close'] = () => status.value = 'closed'

  on(
    element,
    {
      keydown: event => {
        if (predicateEsc(event)) {
          event.preventDefault()
          close()
        }
      },
    }
  )


  // RENDERING
  const conditional = useConditional(
    extendable,
    {
      ...conditionalOptions,
      initialRenders: initialStatus === 'opened',
    }
  )

  watch(
    status,
    () => {
      switch (status.value) {
        case 'opened':
          conditional.render()
          break
        case 'closed':
          conditional.remove()
          break
      }
    }
  )


  // FOCUS MANAGEMENT
  if (trapsFocus) {
    const toFirstFocusable = createFocusable('first'),
          toLastFocusable = createFocusable('last')

    on(
      element,
      {
        focusout: event => {
          if (!event.relatedTarget) {
            event.preventDefault()
            ;(event.target as SupportedElement).focus()
            return
          }

          if (
            event.target === toFirstFocusable(element.value)
            && (
              !element.value.contains(event.relatedTarget as SupportedElement)
              || event.relatedTarget === element.value
            )
          ) {
            event.preventDefault()
            toLastFocusable(element.value).focus()
            return
          }

          if (
            event.target === toLastFocusable(element.value)
            && !element.value.contains(event.relatedTarget as SupportedElement)
          ) {
            event.preventDefault()
            toFirstFocusable(element.value).focus()
            return
          }
        },
      }
    )
  }


  // API
  return {
    status: computed(() => status.value),
    open,
    close,
    toggle,
    is: {
      opened: () => status.value === 'opened',
      closed: () => status.value === 'closed',
      ...conditional.is,
    },
    conditionalStatus: conditional.status,
  }
}
