import {
  ref,
  watch,
  computed,
  type Ref,
  inject,
  onScopeDispose,
} from 'vue'
import { createFocusable } from '@baleada/logic'
import {
  type ExtendableElement,
  type SupportedElement,
  defaultScrollAllowance,
  narrowElement,
  predicateEsc,
  ScrollAllowanceInjectionKey,
} from '../extracted'
import { on } from '../affordances'
import {
  useConditional,
  type Conditional,
  type UseConditionalOptions,
} from './useConditional'

export type Popup = {
  status: Ref<PopupStatus>,
  open: () => PopupStatus,
  close: () => PopupStatus,
  toggle: () => PopupStatus,
  is: Conditional['is'] & {
    opened: () => boolean,
    closed: () => boolean,
  },
  conditionalStatus: Conditional['status'],
}

type PopupStatus = 'opened' | 'closed'

export type UsePopupOptions = {
  initialStatus?: PopupStatus,
  trapsFocus?: boolean,
  conditional?: Omit<UseConditionalOptions, 'initialRenders'>,
  allowsScrollWhenOpened?: boolean,
}

const defaultOptions: UsePopupOptions = {
  initialStatus: 'closed',
  trapsFocus: true,
  allowsScrollWhenOpened: false,
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
    allowsScrollWhenOpened,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const element = narrowElement(extendable)


  // STATUS
  const status: Popup['status'] = ref(initialStatus),
        toggle: Popup['toggle'] = () => status.value === 'opened' ? close() : open(),
        open: Popup['open'] = () => status.value = 'opened',
        close: Popup['close'] = () => status.value = 'closed',
        scrollAllowance = inject(
          ScrollAllowanceInjectionKey,
          defaultScrollAllowance,
        )

  if (!allowsScrollWhenOpened) {
    watch(
      status,
      () => {
        switch (status.value) {
          case 'opened':
            scrollAllowance.disallow()
            break
          case 'closed':
            scrollAllowance.allow()
            break
        }
      },
      { immediate: true }
    )

    onScopeDispose(() => {
      if (status.value === 'opened') scrollAllowance.allow()
    })
  }

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

          if (conditional.is.removed()) return

          if (
            event.target === toFirstFocusable(element.value)
            && (
              !element.value.contains(event.relatedTarget as SupportedElement)
              || event.relatedTarget === element.value
            )
          ) {
            event.preventDefault()
            toLastFocusable(element.value)?.focus()
            return
          }

          if (
            event.target === toLastFocusable(element.value)
            && !element.value.contains(event.relatedTarget as SupportedElement)
          ) {
            event.preventDefault()
            toFirstFocusable(element.value)?.focus()
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
