import { ref, computed, watch, nextTick } from 'vue'
import type { ComputedRef } from 'vue'
import { bind, on } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleElementApi } from '../extracted'

export type Dialog = {
  root: SingleElementApi<HTMLElement>,
  hasPopup: SingleElementApi<HTMLElement>,
  firstFocusable: SingleElementApi<HTMLElement>,
  lastFocusable: SingleElementApi<HTMLElement>,
  status: ComputedRef<'opened' | 'closed'>,
  open: () => void,
  close: () => void,
  is: {
    opened: () => boolean,
    closed: () => boolean,
  }
}

export type UseDialogOptions = {
  alerts?: boolean,
}

const defaultOptions: UseDialogOptions = {
  alerts: false,
}

export function useDialog (options?: UseDialogOptions): Dialog {
  // OPTIONS
  const {
    alerts,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root = useElementApi(),
        hasPopup = useElementApi(),
        firstFocusable = useElementApi(),
        lastFocusable = useElementApi()
  

  // STATUS
  const status = ref<Dialog['status']['value']>('closed'),
        open = () => {
          status.value = 'opened'
          nextTick(() => firstFocusable.element.value.focus())
        },
        close = ({ restoresFocus }: { restoresFocus?: boolean } = { restoresFocus: true}) => {
          status.value = 'closed'
          
          if (restoresFocus) {
            nextTick(() => hasPopup.element.value.focus())
          }
        }


  // HAS POPUP
  on<'mousedown' | 'touchstart' | '+space' | '+enter'>({
    element: hasPopup.element,
    effects: defineEffect => [
      ...(['mousedown', 'touchstart', 'space', 'enter'] as 'mousedown'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          open()
        }
      ))
    ]
  })


  // FOCUS CONTAINMENT
  on<'shift+tab'>({
    element: firstFocusable.element,
    effects: defineEffect => [
      defineEffect(
        'shift+tab',
        event => {
          if (status.value === 'opened') {
            event.preventDefault()
            lastFocusable.element.value.focus()
          }
        }
      ),
    ]
  })
  
  on<'!shift+tab'>({
    element: lastFocusable.element,
    effects: defineEffect => [
      defineEffect(
        '!shift+tab',
        event => {
          if (status.value === 'opened') {
            event.preventDefault()
            firstFocusable.element.value.focus()
          }
        }
      ),
    ]
  })


  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      role: alerts ? 'alertdialog' : 'dialog',
      'aria-modal': true,
    }
  })
  
  bind({
    element: hasPopup.element,
    values: {
      ariaHaspopup: 'dialog',
    }
  })
  
  on<'+esc'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'esc' as '+esc',
        event => {
          if (status.value === 'opened') {
            event.preventDefault()
            close()
          }
        }
      ),
    ]
  })


  // API
  return {
    root,
    hasPopup,
    firstFocusable,
    lastFocusable,
    status: computed(() => status.value),
    open,
    close,
    is: {
      opened: () => status.value === 'opened',
      closed: () => status.value === 'closed',
    }
  }
}
