import { ref, shallowRef, watch } from 'vue'
import { scheduleBindEffect } from '../util'
import type { Target, BindValue, BindValueObject } from '../util'

export type TransitionOption = {
  appear?: Transition | true
  enter?: Transition
  leave?: Transition
}

export type Transition = {
  before?: ({ target, index }: { target: Element, index: number }) => any, 
  active?: ({ target, index, done }: { target: Element, index: number, done: () => void }) => any, 
  after?: ({ target, index }: { target: Element, index: number }) => any, 
  cancel?: ({ target, index }: { target: Element, index: number }) => any, 
}

export function show (
  { target, condition }: { target: Target, condition: BindValue<boolean> },
  options: {
    transition?: TransitionOption
  } = {},
) {
  const originalDisplays = new WeakMap<Element, string>(),
        cancels = new WeakMap<Element, undefined | (() => boolean)>(),
        statuses = new WeakMap<Element, 'appeared'>(),
        { transition } = options

  scheduleBindEffect<boolean>(
    {
      target,
      effect: ({ target, value, index }) => {
        const didCancel = cancels.get(target)?.()

        if (!originalDisplays.get(target)) {
          const originalDisplay = window.getComputedStyle(target).display
          originalDisplays.set(target, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.get(target)

        if (didCancel) {
          cancels.set(target, undefined)

          if (value) {
            // Transition canceled, target should be shown
            if ((target as HTMLElement).style.display === originalDisplay) {
              return
            }

            (target as HTMLElement).style.display = originalDisplay
            return
          }

          // Transition canceled, target should not be shown
          (target as HTMLElement).style.display = 'none'
          return
        }

        // Leave
        if (!value) {
          if ((target as HTMLElement).style.display === 'none') {
            return
          }
  
          const cancel = useTransition({
            target,
            index,
            before: transition?.leave?.before,
            start: () => {},
            active: transition?.leave?.active,
            end: status => {
              if (status === 'canceled') {
                return
              }
  
              (target as HTMLElement).style.display = 'none'
            },
            after: transition?.leave?.after,
            cancel: transition?.leave?.cancel,
          })
  
          cancels.set(target, cancel)
          return
        }

        if (value) {
          // Appear
          if (statuses.get(target) !== 'appeared') {
            if ((target as HTMLElement).style.display === originalDisplay) {
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
              target,
              index,
              before: (hooks as Transition)?.before,
              start: () => ((target as HTMLElement).style.display = originalDisplay),
              active: (hooks as Transition)?.active,
              end: () => {},
              after: (hooks as Transition)?.after,
              cancel: (hooks as Transition)?.cancel,
            })
  
            cancels.set(target, cancel)
            statuses.set(target, 'appeared')
            return
          }

          // Enter
          if ((target as HTMLElement).style.display === originalDisplay) {
            return
          }

          const cancel = useTransition({
            target,
            index,
            before: transition?.enter?.before,
            start: () => ((target as HTMLElement).style.display = originalDisplay),
            active: transition?.enter?.active,
            end: () => {},
            after: transition?.enter?.after,
            cancel: transition?.enter?.cancel,
          })

          cancels.set(target, cancel)
          return
        }
      },
      value: (condition as unknown as BindValueObject<boolean>)?.targetClosure ?? condition,
      watchSources: (condition as unknown as BindValueObject<boolean>)?.watchSources,
    }
  )
}

function useTransition ({ target, index, before, start, active, end, after, cancel }) {
  const status = ref('ready'),
        done = () => {
          stopWatchingStatus()

          end(status.value)

          if (status.value === 'canceled') {
            return
          }

          after?.({ target, index })
          status.value = 'transitioned'
        }

  before?.({ target, index })
  
  start()
  status.value = 'transitioning'

  const stopWatchingStatus = watch(
    [status],
    () => {
      if (status.value === 'canceled') {
        cancel({ target, index })
        done()
      }
    },
    { flush: 'post' }
  )

  if (active) {
    active?.({ target, index, done })
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
