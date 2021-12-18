import { ref, watch } from 'vue'
import { scheduleBind } from '../extracted'
import type { BindElement, BindValue } from '../extracted'
import { BindReactiveValueGetter, ensureValue, ensureWatchSourceOrSources } from './bind'

export type ShowOptions = {
  transition?: TransitionOption
}

export type TransitionOption = {
  appear?: Transition | true
  enter?: Transition
  leave?: Transition
}

export type Transition = {
  before?: ({ element, index }: { element: HTMLElement, index: number }) => any, 
  active?: ({ element, index, done }: { element: HTMLElement, index: number, done: () => void }) => any, 
  after?: ({ element, index }: { element: HTMLElement, index: number }) => any, 
  cancel?: ({ element, index }: { element: HTMLElement, index: number }) => any, 
}

export function show (
  { element, condition }: { element: BindElement, condition: BindValue<boolean> | BindReactiveValueGetter<boolean> },
  options: ShowOptions = {},
) {
  const originalDisplays = new WeakMap<HTMLElement, string>(),
        cancels = new WeakMap<HTMLElement, undefined | (() => boolean)>(),
        statuses = new WeakMap<HTMLElement, 'appeared'>(),
        { transition } = options

  scheduleBind<boolean>(
    {
      element,
      assign: ({ element, value, index }) => {
        const didCancel = cancels.get(element)?.()

        if (!originalDisplays.get(element)) {
          const originalDisplay = window.getComputedStyle(element).display
          originalDisplays.set(element, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.get(element)

        if (didCancel) {
          cancels.set(element, undefined)

          if (value) {
            // Transition canceled, element should be shown
            if ((element as HTMLElement).style.display === originalDisplay) {
              return
            }

            (element as HTMLElement).style.display = originalDisplay
            return
          }

          // Transition canceled, element should not be shown
          (element as HTMLElement).style.display = 'none'
          return
        }

        // Leave
        if (!value) {
          if ((element as HTMLElement).style.display === 'none') {
            return
          }
  
          const cancel = useTransition({
            element,
            index,
            before: transition?.leave?.before,
            start: () => {},
            active: transition?.leave?.active,
            end: status => {
              if (status === 'canceled') {
                return
              }
  
              (element as HTMLElement).style.display = 'none'
            },
            after: transition?.leave?.after,
            cancel: transition?.leave?.cancel,
          })
  
          cancels.set(element, cancel)
          return
        }

        if (value) {
          // Appear
          if (statuses.get(element) !== 'appeared') {
            if ((element as HTMLElement).style.display === originalDisplay) {
              return
            }

            const hooks = (
              (transition?.appear === true && transition?.enter)
              ||
              (transition?.appear === false && {})
              ||
              (transition?.appear)
            )
  
            const cancel = useTransition({
              element,
              index,
              before: (hooks as Transition)?.before,
              start: () => ((element as HTMLElement).style.display = originalDisplay),
              active: (hooks as Transition)?.active,
              end: () => {},
              after: (hooks as Transition)?.after,
              cancel: (hooks as Transition)?.cancel,
            })
  
            cancels.set(element, cancel)
            statuses.set(element, 'appeared')
            return
          }

          // Enter
          if ((element as HTMLElement).style.display === originalDisplay) {
            return
          }

          const cancel = useTransition({
            element,
            index,
            before: transition?.enter?.before,
            start: () => ((element as HTMLElement).style.display = originalDisplay),
            active: transition?.enter?.active,
            end: () => {},
            after: transition?.enter?.after,
            cancel: transition?.enter?.cancel,
          })

          cancels.set(element, cancel)
          return
        }
      },
      remove: () => {},
      value: ensureValue(condition) as BindValue<boolean>,
      watchSources: ensureWatchSourceOrSources(condition),
    }
  )
}

function useTransition ({ element, index, before, start, active, end, after, cancel }) {
  const status = ref('ready'),
        done = () => {
          stopWatchingStatus()

          end(status.value)

          if (status.value === 'canceled') {
            return
          }

          after?.({ element, index })
          status.value = 'transitioned'
        }

  before?.({ element, index })
  
  start()
  status.value = 'transitioning'

  const stopWatchingStatus = watch(
    [status],
    () => {
      if (status.value === 'canceled') {
        cancel({ element, index })
        done()
      }
    },
    { flush: 'post' }
  )

  if (active) {
    active?.({ element, index, done })
  } else {
    done()
  }

  return () => {
    if (status.value === 'transitioned') {
      return false
    }
    
    status.value = 'canceled'
    return true
  }
}
