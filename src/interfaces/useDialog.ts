import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { bind, on } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleElementApi } from '../extracted'

export type Dialog = {
  root: SingleElementApi<HTMLElement>,
  firstFocusable: SingleElementApi<HTMLElement>,
  lastFocusable: SingleElementApi<HTMLElement>,
  status: ComputedRef<'opened' | 'closed'>,
  open: () => void,
  close: () => void,
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
        previouslyFocused.value = document.activeElement as HTMLElement
        firstFocusable.element.value.focus()
        return
      }

      previouslyFocused.value.focus()
    },
    { flush: 'post' }
  )

  // FOCUS CONTAINMENT
  on<'blur'>({
    element: lastFocusable.element,
    effects: defineEffect => [
      defineEffect(
        'blur',
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
    firstFocusable,
    lastFocusable,
    status: computed(() => status.value),
    open,
    close,
  }
}
