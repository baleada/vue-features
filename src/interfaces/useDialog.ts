import { ref, computed, watch, nextTick } from 'vue'
import type { ComputedRef } from 'vue'
import { bind, on } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleIdentifiedElementApi, SingleElementApi } from '../extracted'

// TODO: For a clearable listbox inside a dialog (does/should this happen?) the
// dialog should not close on ESC when the listbox has focus.

export type Dialog = {
  root: SingleIdentifiedElementApi<HTMLElement>,
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
  const root = useElementApi({ identified: true }),
        hasPopup = useElementApi(),
        firstFocusable = useElementApi(),
        lastFocusable = useElementApi()
  

  // STATUS
  const status = ref<Dialog['status']['value']>('closed'),
        previouslyFocused = ref<HTMLElement>(),
        open = () => {
          status.value = 'opened'
        },
        close = () => {
          status.value = 'closed'
        }

  watch(
    status,
    () => {
      if (status.value === 'opened') {
        // Need to wait for next tick in case the dialog is implemented as
        // a conditionally rendered component.
        nextTick(() => firstFocusable.element.value.focus())
        return
      }

      hasPopup.element.value.focus()
    },
    { flush: 'post' }
  )


  // HAS POPUP
  // TODO: Combo with button
  on<'mousedown' | 'touchstart' | '+space' | '+enter'>(
    hasPopup.element,
    defineEffect => [
      ...(['mousedown', 'touchstart', 'space', 'enter'] as 'mousedown'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          open()
        }
      ))
    ]
  )


  // FOCUS CONTAINMENT
  on<'shift+tab'>(
    firstFocusable.element,
    defineEffect => [
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
  )
  
  on<'!shift+tab'>(
    lastFocusable.element,
    defineEffect => [
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
  )


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: alerts ? 'alertdialog' : 'dialog',
      'aria-modal': true,
    }
  )
  
  bind(
    hasPopup.element,
    { ariaHaspopup: 'dialog' }
  )
  
  on<'+esc'>(
    root.element,
    defineEffect => [
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
  )


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
